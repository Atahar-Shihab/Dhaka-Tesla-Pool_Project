process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/dhaka_tesla_pool';
process.env.JWT_SECRET = 'dhaka-tesla-pool-secret-key-2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '0';

const { describe, it, expect, beforeAll, afterAll } = require('vitest');
const request = require('supertest');
const { app, prisma } = require('./setup');

describe('Pool Capacity Critical Test', () => {
  let tokens = {};
  let users = {};
  let loc1, loc2;
  let vehicleId;

  beforeAll(async () => {
    const createOrLogin = async (email, name, role) => {
      const login = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
      if(login.status === 200) return login.body.token;
      const reg = await request(app).post('/api/auth/register').send({ name, email, password: 'password123', role });
      return reg.body.token;
    };

    tokens.jashim = await createOrLogin('jashim@teslapool.com', 'Jashim', 'DRIVER');
    tokens.nusrat = await createOrLogin('nusrat@teslapool.com', 'Nusrat', 'PASSENGER');
    tokens.rafiq = await createOrLogin('rafiq@teslapool.com', 'Rafiq', 'PASSENGER');
    tokens.shirin = await createOrLogin('shirin@teslapool.com', 'Shirin', 'PASSENGER');
    tokens.fourth = await createOrLogin('fourth@teslapool.com', 'Fourth', 'PASSENGER');

    for (let key of Object.keys(tokens)) {
      const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokens[key]}`);
      users[key] = me.body.data;
    }

    // Set up vehicle capacity to 3 for Jashim
    const existingVehicle = await prisma.vehicle.findUnique({ where: { driverId: users.jashim.id } });
    if(existingVehicle) {
      await prisma.vehicle.update({ where: { id: existingVehicle.id }, data: { capacity: 3, isActive: true } });
      vehicleId = existingVehicle.id;
    } else {
      const v = await prisma.vehicle.create({
        data: {
          driverId: users.jashim.id,
          name: 'Tesla Model Y',
          capacity: 3,
          isActive: true
        }
      });
      vehicleId = v.id;
    }

    // Close any previous open pools for clean slate
    await prisma.pool.updateMany({
      where: { driverId: users.jashim.id, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      data: { status: 'COMPLETED' }
    });

    loc1 = await prisma.location.findFirst();
    loc2 = await prisma.location.findFirst({ skip: 1 });
    if(!loc1 || !loc2) {
      loc1 = await prisma.location.create({ data: { name: 'Cap Loc 1', latitude: 23.7, longitude: 90.4 } });
      loc2 = await prisma.location.create({ data: { name: 'Cap Loc 2', latitude: 23.8, longitude: 90.5 } });
    }
  });

  afterAll(async () => {
    // Cleanup pools for Jashim
    await prisma.pool.deleteMany({ where: { driverId: users.jashim.id } });
    await prisma.rideRequest.deleteMany({ 
      where: { passengerId: { in: [users.nusrat.id, users.rafiq.id, users.shirin.id, users.fourth.id] } } 
    });
  });

  const requestRide = async (token) => {
    const res = await request(app)
      .post('/api/rides/request')
      .set('Authorization', `Bearer ${token}`)
      .send({ pickupLocationId: loc1.id, dropoffLocationId: loc2.id, seatsNeeded: 1 });
    return res.body.data.id;
  };

  const acceptRide = async (rideId) => {
    return await request(app)
      .post(`/api/driver/accept/${rideId}`)
      .set('Authorization', `Bearer ${tokens.jashim}`);
  };

  it('Bullet has capacity 3', async () => {
    const v = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(v.capacity).toBe(3);
  });

  let r1, r2, r3, r4;

  it('First passenger (1 seat) is accepted — pool has 1/3 seats', async () => {
    r1 = await requestRide(tokens.nusrat);
    const res = await acceptRide(r1);
    expect(res.status).toBe(200);
    const pool = await prisma.pool.findUnique({ where: { id: res.body.data.poolId } });
    expect(pool.occupiedSeats).toBe(1);
  });

  it('Second passenger (1 seat) is accepted — pool has 2/3 seats', async () => {
    r2 = await requestRide(tokens.rafiq);
    const res = await acceptRide(r2);
    expect(res.status).toBe(200);
    const pool = await prisma.pool.findUnique({ where: { id: res.body.data.poolId } });
    expect(pool.occupiedSeats).toBe(2);
  });

  it('Third passenger (1 seat) is accepted — pool has 3/3 seats', async () => {
    r3 = await requestRide(tokens.shirin);
    const res = await acceptRide(r3);
    expect(res.status).toBe(200);
    const pool = await prisma.pool.findUnique({ where: { id: res.body.data.poolId } });
    expect(pool.occupiedSeats).toBe(3);
  });

  it('Fourth passenger REJECTED — pool is full (3/3)', async () => {
    r4 = await requestRide(tokens.fourth);
    const res = await acceptRide(r4);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Not enough seats');
  });

  it('After completing one ride, seats are freed', async () => {
    // Start trip
    await request(app).patch(`/api/driver/rides/${r1}/arrive`).set('Authorization', `Bearer ${tokens.jashim}`);
    await request(app).patch(`/api/driver/rides/${r1}/start`).set('Authorization', `Bearer ${tokens.jashim}`);
    
    // Complete trip for passenger 1
    const compRes = await request(app).patch(`/api/driver/rides/${r1}/complete`).set('Authorization', `Bearer ${tokens.jashim}`);
    expect(compRes.status).toBe(200);
    
    const ride = await prisma.rideRequest.findUnique({ where: { id: r1 } });
    const pool = await prisma.pool.findUnique({ where: { id: ride.poolId } });
    expect(pool.occupiedSeats).toBe(2); // 3 - 1 = 2

    // Now fourth passenger can be accepted
    const res = await acceptRide(r4);
    expect(res.status).toBe(200);
    const poolAfter = await prisma.pool.findUnique({ where: { id: res.body.data.poolId } });
    expect(poolAfter.occupiedSeats).toBe(3);
  });
});

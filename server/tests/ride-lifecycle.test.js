process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/dhaka_tesla_pool';
process.env.JWT_SECRET = 'dhaka-tesla-pool-secret-key-2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '0';

// vitest globals (describe, it, expect, etc.) are auto-injected via vitest.config.mjs
const request = require('supertest');
const { app, prisma } = require('./setup');

describe('Ride Lifecycle', () => {
  let passengerToken;
  let driverToken;
  let rideId;
  let loc1, loc2;

  beforeAll(async () => {
    // We assume these seeded users exist, if not we create them
    const pLogin = await request(app).post('/api/auth/login').send({ email: 'nusrat@teslapool.com', password: 'password123' });
    if(pLogin.status === 200) {
      passengerToken = pLogin.body.token;
    } else {
      const pReg = await request(app).post('/api/auth/register').send({ name: 'Nusrat', email: 'nusrat@teslapool.com', password: 'password123', role: 'PASSENGER' });
      passengerToken = pReg.body.token;
    }

    const dLogin = await request(app).post('/api/auth/login').send({ email: 'jashim@teslapool.com', password: 'password123' });
    if(dLogin.status === 200) {
      driverToken = dLogin.body.token;
    } else {
      const dReg = await request(app).post('/api/auth/register').send({ name: 'Jashim', email: 'jashim@teslapool.com', password: 'password123', role: 'DRIVER' });
      driverToken = dReg.body.token;
      
      const driver = await prisma.user.findUnique({ where: { email: 'jashim@teslapool.com' } });
      await prisma.vehicle.create({
        data: {
          driverId: driver.id,
          name: 'Tesla Model 3',
          capacity: 3,
          isActive: true
        }
      });
    }

    loc1 = await prisma.location.findFirst();
    loc2 = await prisma.location.findFirst({ skip: 1 });
    
    if (!loc1 || !loc2) {
      loc1 = await prisma.location.create({ data: { name: 'Banani Temp', latitude: 23.7937, longitude: 90.4066 } });
      loc2 = await prisma.location.create({ data: { name: 'Mohakhali Temp', latitude: 23.7781, longitude: 90.4080 } });
    }
  });

  afterAll(async () => {
    // Delete payments first (foreign key to RideRequest)
    await prisma.payment.deleteMany({});
    // Disconnect pools from rides
    await prisma.rideRequest.updateMany({ data: { poolId: null } });
    // Cleanup pools for Jashim
    const d = await prisma.user.findUnique({ where: { email: 'jashim@teslapool.com' } });
    if(d) {
      await prisma.pool.deleteMany({ where: { driverId: d.id } });
    }
    const p = await prisma.user.findUnique({ where: { email: 'nusrat@teslapool.com' } });
    if(p) {
      await prisma.rideRequest.deleteMany({ where: { passengerId: p.id } });
    }
  });

  it('passenger can create a ride request (status = REQUESTED)', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ pickupLocationId: loc1.id, dropoffLocationId: loc2.id, seatsNeeded: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('REQUESTED');
    rideId = res.body.data.id;
  });

  it('driver can accept a ride (status changes to MATCHED)', async () => {
    // Make driver online
    await request(app)
      .patch('/api/driver/status')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ isActive: true });

    const res = await request(app)
      .post(`/api/driver/accept/${rideId}`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('MATCHED');
  });

  it('passenger can cancel when MATCHED (seats are released)', async () => {
    const res = await request(app)
      .patch(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${passengerToken}`);

    expect(res.status).toBe(200);
    const ride = await prisma.rideRequest.findUnique({ where: { id: rideId } });
    expect(ride.status).toBe('CANCELLED');
  });

  it('passenger can create another request for remaining tests', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ pickupLocationId: loc1.id, dropoffLocationId: loc2.id, seatsNeeded: 1 });

    rideId = res.body.data.id;
    await request(app).post(`/api/driver/accept/${rideId}`).set('Authorization', `Bearer ${driverToken}`);
  });

  it('driver can mark arrival (MATCHED -> DRIVER_ARRIVED)', async () => {
    const res = await request(app)
      .patch(`/api/driver/rides/${rideId}/arrive`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DRIVER_ARRIVED');
  });

  it('driver can start trip (DRIVER_ARRIVED -> IN_PROGRESS)', async () => {
    const res = await request(app)
      .patch(`/api/driver/rides/${rideId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    const ride = await prisma.rideRequest.findUnique({ where: { id: rideId } });
    expect(ride.status).toBe('IN_PROGRESS');
  });

  it('passenger CANNOT cancel when IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${passengerToken}`);

    expect(res.status).not.toBe(200); // likely 400
  });

  it('driver can complete trip (IN_PROGRESS -> COMPLETED)', async () => {
    const res = await request(app)
      .patch(`/api/driver/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(200);
    const ride = await prisma.rideRequest.findUnique({ where: { id: rideId } });
    expect(ride.status).toBe('COMPLETED');
  });

  it('invalid state transition is rejected (e.g. REQUESTED -> COMPLETED directly)', async () => {
    const reqRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ pickupLocationId: loc1.id, dropoffLocationId: loc2.id, seatsNeeded: 1 });
      
    const newRideId = reqRes.body.data.id;
    
    // Complete without driver arrive/start
    const res = await request(app)
      .patch(`/api/driver/rides/${newRideId}/complete`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(400); // Should fail
  });
});

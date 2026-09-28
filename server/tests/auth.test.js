process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/dhaka_tesla_pool';
process.env.JWT_SECRET = 'dhaka-tesla-pool-secret-key-2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '0';

// vitest globals (describe, it, expect, etc.) are auto-injected via vitest.config.mjs
const request = require('supertest');
const { app, prisma } = require('./setup');

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Auth Test User',
    email: 'auth_test@example.com',
    password: 'password123',
    role: 'PASSENGER'
  };

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  it('POST /api/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
      
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
      
    expect(res.status).toBe(400); // Or whatever error code you use for duplication
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
      
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns current user with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe(testUser.email);
  });

  it('GET /api/auth/me rejects invalid token', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer invalid-token`);

    expect(meRes.status).toBe(401);
  });
});

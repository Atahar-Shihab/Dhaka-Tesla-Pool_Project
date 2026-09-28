process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/dhaka_tesla_pool';
process.env.JWT_SECRET = 'dhaka-tesla-pool-secret-key-2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '0';

const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const app = require('../src/app.js');

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Helper to create a test user
 */
async function createTestUser(role, email, name, password) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, role });
  return { user: res.body.data, token: res.body.token };
}

/**
 * Helper to login user
 */
async function loginUser(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

module.exports = {
  prisma,
  app,
  createTestUser,
  loginUser,
};

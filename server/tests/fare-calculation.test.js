process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/dhaka_tesla_pool';
process.env.JWT_SECRET = 'dhaka-tesla-pool-secret-key-2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '0';

const { describe, it, expect } = require('vitest');
const { calculateFare, formatFare } = require('../src/utils/fareCalculator');

describe('Fare Calculation', () => {
  // Coordinates for test locations
  const banani = { latitude: 23.7937, longitude: 90.4066 };
  const mohakhali = { latitude: 23.7781, longitude: 90.4080 };
  const gulshan1 = { latitude: 23.7808, longitude: 90.4169 };

  it('calculates base fare correctly (30 BDT = 3000 poysha)', () => {
    const result = calculateFare(banani, banani, false);
    expect(result.baseFare).toBe(3000);
  });

  it('calculates Nusrat\'s fare from Banani to Mohakhali without pool', () => {
    const result = calculateFare(banani, mohakhali, false);
    expect(result.poolDiscount).toBe(0);
    expect(result.totalFare).toBe(result.baseFare + result.distanceCharge);
    expect(Number.isInteger(result.totalFare)).toBe(true);
  });

  it('calculates Nusrat\'s fare with pool discount (20% off)', () => {
    const withoutPool = calculateFare(banani, mohakhali, false);
    const withPool = calculateFare(banani, mohakhali, true);
    
    expect(withPool.poolDiscount).toBeGreaterThan(0);
    expect(withPool.totalFare).toBe(withoutPool.totalFare - withPool.poolDiscount);
    expect(Number.isInteger(withPool.totalFare)).toBe(true);
  });

  it('calculates Rafiq\'s fare from Banani to Gulshan 1 with pool', () => {
    const result = calculateFare(banani, gulshan1, true);
    expect(result.poolDiscount).toBeGreaterThan(0);
    expect(Number.isInteger(result.totalFare)).toBe(true);
  });

  it('ensures pool discount is exactly 20%', () => {
    const result = calculateFare(banani, mohakhali, true);
    const expectedDiscount = Math.round(((result.baseFare + result.distanceCharge) * 20) / 100);
    expect(result.poolDiscount).toBe(expectedDiscount);
  });

  it('formats fare string correctly', () => {
    expect(formatFare(3000)).toBe('30.00 BDT');
    expect(formatFare(4550)).toBe('45.50 BDT');
    expect(formatFare(null)).toBe('0.00 BDT');
    expect(formatFare(undefined)).toBe('0.00 BDT');
  });
});

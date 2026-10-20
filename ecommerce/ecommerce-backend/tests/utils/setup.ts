/// <reference types="jest" />
import { beforeAll, afterAll, jest } from '@jest/globals';
import { loadEnv, getDatabaseUrl, redisClient } from '../../src/utils';
import { closeDatabase } from '../../src/database';

// Mock problematic ES module dependencies BEFORE any imports
// Mock jose library (ESM compatibility issue)
jest.mock('jose', () => ({
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      sub: 'mock-user-id',
      email: 'mock@example.com',
      role: 'authenticated',
    },
  }),
  createRemoteJWKSet: jest.fn(() => 'mock-jwks'),
}));

// Mock isomorphic-dompurify
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((input: string) => input), // Mock sanitize to return input unchanged
}));

// Set test environment FIRST
process.env.NODE_ENV = 'test';

// Load environment from .env.dev (same as development)
loadEnv();

// Convert Docker hostname to localhost for host-based test runs
process.env.DATABASE_URL = getDatabaseUrl();

// Global test timeout
jest.setTimeout(30000);

// Seed RBAC data for all tests
beforeAll(async () => {
  const { SupabaseAuthHelper } = await import('./supabase-auth.helper');
  await SupabaseAuthHelper.seedRBACData();
});

// Close connections after all tests in file
afterAll(async () => {
  await closeDatabase();
  if (redisClient.isOpen) {
    await redisClient.disconnect();
  }
});

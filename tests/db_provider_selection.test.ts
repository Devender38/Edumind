import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPrismaClient, getActiveDbProvider } from '../src/db/client';

describe('Deterministic Database Provider Selection & Safety Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.DB_PROVIDER;
    delete process.env.MONGODB_URI;
    delete process.env.DATABASE_URL_PG;
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('1. DB_PROVIDER=mongodb with missing MONGODB_URI fails fast with fatal error', () => {
    process.env.DB_PROVIDER = 'mongodb';
    delete process.env.MONGODB_URI;

    expect(() => {
      createPrismaClient();
    }).toThrow(/FATAL DB ERROR.*MONGODB_URI environment variable is missing/);
  });

  it('2. DB_PROVIDER=postgres with missing DATABASE_URL fails fast with fatal error', () => {
    process.env.DB_PROVIDER = 'postgres';
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_PG;

    expect(() => {
      createPrismaClient();
    }).toThrow(/FATAL DB ERROR.*DATABASE_URL is missing/);
  });

  it('3. Unset DB_PROVIDER defaults safely to SQLite for development/test environment', () => {
    delete process.env.DB_PROVIDER;
    createPrismaClient();
    expect(getActiveDbProvider()).toBe('sqlite');
  });

  it('4. DB_PROVIDER=mongodb with valid MONGODB_URI resolves client without fragile hardcoded path error', () => {
    process.env.DB_PROVIDER = 'mongodb';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';

    let client: any;
    expect(() => {
      client = createPrismaClient();
    }).not.toThrow(/the URL must start with the protocol file/);
    expect(getActiveDbProvider()).toBe('mongodb');
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getApiUrl } from '../src/frontend/config/apiConfig';

describe('Frontend API Base URL Configuration Safeguards', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('1. Returns relative path in local development mode (when VITE_API_BASE_URL is empty)', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const url = getApiUrl('/api/v1/health');
    expect(url).toBe('/api/v1/health');
  });

  it('2. Prepends production backend origin when VITE_API_BASE_URL is configured', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://resolvex-backend-78ys.onrender.com');
    const url = getApiUrl('/api/v1/health');
    expect(url).toBe('https://resolvex-backend-78ys.onrender.com/api/v1/health');
  });

  it('3. Safely strips trailing slashes from VITE_API_BASE_URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://resolvex-backend-78ys.onrender.com/');
    const url = getApiUrl('/api/v1/health');
    expect(url).toBe('https://resolvex-backend-78ys.onrender.com/api/v1/health');
  });

  it('4. Prevents duplicate /api/v1/api/v1 paths if VITE_API_BASE_URL already contains /api/v1', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://resolvex-backend-78ys.onrender.com/api/v1');
    const url = getApiUrl('/api/v1/health');
    expect(url).toBe('https://resolvex-backend-78ys.onrender.com/api/v1/health');
  });
});

/// <reference types="jest" />
import { getApiBaseUrl } from '../../../config/env';

describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default localhost url when no valid environment variable is set', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    const { getApiBaseUrl } = require('../../../config/env');
    expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
  });

  it('returns processed environment variable when set', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://test-server:5000/api';
    const { getApiBaseUrl } = require('../../../config/env');
    expect(getApiBaseUrl()).toBe('http://test-server:5000/api');
  });

  it('trims trailing slashes from the API URL', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://production-api.com/api//';
    (global as any).__DEV__ = true;
    const { getApiBaseUrl } = require('../../../config/env');
    expect(getApiBaseUrl()).toBe('https://production-api.com/api');
  });

  it('throws an error in production if the base url does not use https', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://not-secure.com/api';
    (global as any).__DEV__ = false;
    const { getApiBaseUrl } = require('../../../config/env');
    expect(() => getApiBaseUrl()).toThrow(
      'Set EXPO_PUBLIC_API_URL to https://...',
    );
  });

  it('does not throw an error in production if the base url uses https', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://secure-prod.com/api';
    (global as any).__DEV__ = false;
    const { getApiBaseUrl } = require('../../../config/env');
    expect(() => getApiBaseUrl()).not.toThrow();
    expect(getApiBaseUrl()).toBe('https://secure-prod.com/api');
  });
});

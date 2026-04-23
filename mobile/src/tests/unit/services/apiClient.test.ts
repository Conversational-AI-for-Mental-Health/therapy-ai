/// <reference types="jest" />
import { apiFetch, readJson } from '../../../services/apiClient';
import * as env from '../../../config/env';

jest.mock('../../../config/env', () => ({
  getApiBaseUrl: jest.fn(),
}));

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (env.getApiBaseUrl as jest.Mock).mockReturnValue('http://localhost:3000/api');
    global.fetch = jest.fn();
  });

  describe('apiFetch', () => {
    it('constructs url correctly with leading slash', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await apiFetch('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test-endpoint',
        expect.any(Object)
      );
    });

    it('constructs url correctly without leading slash', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await apiFetch('test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test-endpoint',
        expect.any(Object)
      );
    });

    it('adds Content-Type application/json by default', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await apiFetch('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('adds Authorization header when accessToken is provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await apiFetch('/test', { accessToken: 'mock-token' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('strips accessToken from fetch options', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await apiFetch('/test', { accessToken: 'mock-token', method: 'POST' });

      const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchOptions.accessToken).toBeUndefined();
      expect(fetchOptions.method).toBe('POST');
    });
  });

  describe('readJson', () => {
    it('returns null if response text is empty', async () => {
      const mockRes = {
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response;

      const result = await readJson(mockRes);
      expect(result).toBeNull();
    });

    it('returns parsed json for valid json response', async () => {
      const mockRes = {
        text: jest.fn().mockResolvedValue('{"success":true,"data":"test"}'),
      } as unknown as Response;

      const result = await readJson(mockRes);
      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('returns null when json parsing fails', async () => {
      const mockRes = {
        text: jest.fn().mockResolvedValue('not json'),
      } as unknown as Response;

      const result = await readJson(mockRes);
      expect(result).toBeNull();
    });
  });
});

/// <reference types="jest" />
import journalApi from '../../../services/journalApi';
import { apiFetch, readJson } from '../../../services/apiClient';
import { getValidToken } from '../../../services/authApi';

jest.mock('../../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../../services/authApi', () => ({
  getValidToken: jest.fn(),
}));

describe('journalApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getValidToken as jest.Mock).mockResolvedValue('mock-token');
  });

  it('getEntries fetches multiple entries', async () => {
    const mockData = [{ _id: '1' }, { _id: '2' }];
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockData });

    const result = await journalApi.getEntries();

    expect(apiFetch).toHaveBeenCalledWith('/journal', { accessToken: 'mock-token' });
    expect(result).toEqual(mockData);
  });

  it('createEntry posts successfully', async () => {
    const mockData = { _id: 'new', text: 'hello' };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockData });

    const result = await journalApi.createEntry('hello', 'Happy', '😊');

    expect(apiFetch).toHaveBeenCalledWith('/journal', {
      method: 'POST',
      body: JSON.stringify({ text: 'hello', mood: 'Happy', moodIcon: '😊' }),
      accessToken: 'mock-token',
    });
    expect(result).toEqual(mockData);
  });

  it('updateEntry patches text to valid ID', async () => {
    const mockData = { _id: '1', text: 'updated' };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockData });

    const result = await journalApi.updateEntry('1', 'updated');

    expect(apiFetch).toHaveBeenCalledWith('/journal/1', {
      method: 'PATCH',
      body: JSON.stringify({ text: 'updated' }),
      accessToken: 'mock-token',
    });
    expect(result).toEqual(mockData);
  });

  it('deleteEntry issues a DELETE request', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: null });

    await journalApi.deleteEntry('1');

    expect(apiFetch).toHaveBeenCalledWith('/journal/1', {
      method: 'DELETE',
      accessToken: 'mock-token',
    });
  });

  it('fails gracefully when token is absent', async () => {
    (getValidToken as jest.Mock).mockResolvedValue(null);

    await expect(journalApi.getEntries()).rejects.toThrow('Not authenticated');
  });

  it('propagates API error smoothly', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: false });
    (readJson as jest.Mock).mockResolvedValue({ success: false, error: 'Database disconnected' });

    await expect(journalApi.getEntries()).rejects.toThrow('Database disconnected');
  });
});

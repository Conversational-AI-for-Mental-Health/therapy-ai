/// <reference types="jest" />
import conversationApi from '../../../services/conversationApi';
import { apiFetch, readJson } from '../../../services/apiClient';
import { getValidToken } from '../../../services/authApi';

jest.mock('../../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../../services/authApi', () => ({
  getValidToken: jest.fn(),
}));

describe('conversationApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getValidToken as jest.Mock).mockResolvedValue('mock-token');
  });

  it('createConversation sends POST correctly', async () => {
    const mockData = { _id: 'c1' };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockData });

    const result = await conversationApi.createConversation('New Title');

    expect(apiFetch).toHaveBeenCalledWith('/conversations', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New Title' }),
      accessToken: 'mock-token',
    }));
    expect(result).toEqual(mockData);
  });

  it('getConversationList handles params and pagination', async () => {
    const mockData = { success: true, data: [], pagination: { hasMore: false } };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue(mockData);

    const result = await conversationApi.getConversationList(2, 10, true);

    expect(apiFetch).toHaveBeenCalledWith('/conversations/mobile-list?page=2&pageSize=10&archived=true', {
      accessToken: 'mock-token',
    });
    expect(result).toEqual(mockData);
  });

  it('getConversation fetches messages with cursor filtering', async () => {
    const mockConv = { _id: 'c1', messages: [] };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockConv });

    const result = await conversationApi.getConversation('c1', 20, 'cursor-ts');

    expect(apiFetch).toHaveBeenCalledWith('/conversations/c1?limit=20&before=cursor-ts', {
      accessToken: 'mock-token',
    });
    expect(result).toEqual(mockConv);
  });

  it('updateTitle patches specific conversation', async () => {
    const mockData = { _id: 'c1', title: 'Updated' };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: mockData });

    const result = await conversationApi.updateTitle('c1', 'Updated');

    expect(apiFetch).toHaveBeenCalledWith('/conversations/c1/title', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    }));
    expect(result).toEqual(mockData);
  });

  it('deleteConversation issues DELETE', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({ success: true, data: {} });

    await conversationApi.deleteConversation('c1');

    expect(apiFetch).toHaveBeenCalledWith('/conversations/c1', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('sendMessage sends chat and returns message payload', async () => {
    const mockData = { success: true, data: { aiMessage: { text: 'Hi' } } };
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue(mockData);

    const result = await conversationApi.sendMessage('c1', 'Hello');

    expect(apiFetch).toHaveBeenCalledWith('/chat/mobile', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ conversationId: 'c1', message: 'Hello' }),
      accessToken: 'mock-token',
    }));
    expect(result).toEqual(mockData);
  });

  it('throws standard error if API returns ok: false', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: false });
    (readJson as jest.Mock).mockResolvedValue({ success: false, error: 'Custom Failure' });

    await expect(conversationApi.createConversation()).rejects.toThrow('Custom Failure');
  });
});

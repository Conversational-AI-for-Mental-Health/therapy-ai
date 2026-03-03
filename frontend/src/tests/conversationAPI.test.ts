import conversationAPI from '../util/conversationAPI';
import { mockConversation, mockConversations } from './mocks/mockData';

describe('ConversationAPI', () => {
  const API_URL = 'http://localhost:3000/api';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createConversation', () => {
    it('should create a new conversation successfully', async () => {
      const mockResponse = {
        success: true,
        data: mockConversation,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.createConversation('New Chat');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'New Chat' }),
        }),
      );
      expect(result).toEqual(mockConversation);
    });

    it('should throw error when no data returned', async () => {
      const mockResponse = {
        success: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(
        conversationAPI.createConversation('New Chat'),
      ).rejects.toThrow('No data returned from API');
    });
  });

  describe('getAllConversations', () => {
    it('should fetch all conversations', async () => {
      const mockResponse = {
        success: true,
        data: mockConversations,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.getAllConversations();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations?archived=false`,
        expect.any(Object),
      );
      expect(result).toEqual(mockConversations);
    });

    it('should include archived conversations when requested', async () => {
      const mockResponse = {
        success: true,
        data: mockConversations,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await conversationAPI.getAllConversations(true);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations?archived=true`,
        expect.any(Object),
      );
    });

    it('should return empty array when no data', async () => {
      const mockResponse = {
        success: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.getAllConversations();

      expect(result).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should fetch a single conversation with messages', async () => {
      const mockResponse = {
        success: true,
        data: mockConversation,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.getConversation(
        mockConversation._id,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}?limit=50`,
        expect.any(Object),
      );
      expect(result).toEqual(mockConversation);
    });

    it('should respect custom message limit', async () => {
      const mockResponse = {
        success: true,
        data: mockConversation,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await conversationAPI.getConversation(mockConversation._id, 100);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}?limit=100`,
        expect.any(Object),
      );
    });

    it('should throw error when conversation not found', async () => {
      const mockResponse = {
        success: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(
        conversationAPI.getConversation('invalid-id'),
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('updateTitle', () => {
    it('should update conversation title', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockConversation, title: 'Updated Title' },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.updateTitle(
        mockConversation._id,
        'Updated Title',
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}/title`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            title: 'Updated Title',
          }),
        }),
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('archiveConversation', () => {
    it('should archive a conversation', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockConversation, archived: true },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await conversationAPI.archiveConversation(
        mockConversation._id,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}/archive`,
        expect.objectContaining({
          method: 'PATCH',
        }),
      );
      expect(result.archived).toBe(true);
    });
  });

  describe('unarchiveConversation', () => {
    it('should unarchive a conversation', async () => {
      const mockResponse = {
        success: true,
        data: mockConversation,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await conversationAPI.unarchiveConversation(mockConversation._id);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}/unarchive`,
        expect.objectContaining({
          method: 'PATCH',
        }),
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const mockResponse = {
        success: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await conversationAPI.deleteConversation(mockConversation._id);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/conversations/${mockConversation._id}`,
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should throw error when API request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'API Error' }),
      });

      await expect(conversationAPI.getAllConversations()).rejects.toThrow(
        'API Error',
      );
    });

    it('should throw error on network failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(conversationAPI.getAllConversations()).rejects.toThrow(
        'Network error',
      );
    });
  });
});

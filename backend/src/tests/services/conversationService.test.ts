import { ConversationService, UserService } from '../../services';
import { User, Conversation } from '../../models';
import { Types } from 'mongoose';
import '../setup';

describe('ConversationService', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await UserService.createUser(
      'Test User',
      'test@example.com',
      'password123',
    );
    userId = user._id.toString();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const conversation = await ConversationService.createConversation(
        userId,
        'Test Chat',
      );

      expect(conversation._id).toBeDefined();
      expect(conversation.user_id.toString()).toBe(userId);
      expect(conversation.title).toBe('Test Chat');

      // Verify user has conversation reference
      const user = await User.findById(userId);
      expect(user?.conversations).toContainEqual(conversation._id);
    });

    it('should create with default title', async () => {
      const conversation = await ConversationService.createConversation(userId);

      expect(conversation.title).toBe('New Conversation');
    });
  });

  describe('getUserConversations', () => {
    it('should get all non-archived conversations', async () => {
      await ConversationService.createConversation(userId, 'Chat 1');
      await ConversationService.createConversation(userId, 'Chat 2');

      const conversations =
        await ConversationService.getUserConversations(userId);

      expect(conversations).toHaveLength(2);
      expect(conversations[0].messages).toBeUndefined();
    });

    it('should exclude deleted conversations', async () => {
      const conv1 = await ConversationService.createConversation(userId);
      const conv2 = await ConversationService.createConversation(userId);

      await ConversationService.deleteConversation(conv1._id, userId);

      const conversations =
        await ConversationService.getUserConversations(userId);

      expect(conversations).toHaveLength(1);
      expect(conversations[0]._id.toString()).toBe(conv2._id.toString());
    });
  });

  describe('addMessage', () => {
    it('should add a message to conversation', async () => {
      const conversation = await ConversationService.createConversation(userId);

      const updated = await ConversationService.addMessage(
        conversation._id,
        userId,
        'user',
        'Hello, world!',
      );

      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].text).toBe('Hello, world!');
      expect(updated.messages[0].sender).toBe('user');
    });

    it('should throw error for non-existent conversation', async () => {
      const fakeId = new Types.ObjectId();

      await expect(
        ConversationService.addMessage(fakeId, userId, 'user', 'Test'),
      ).rejects.toThrow('Conversation not found');
    });
  });
});

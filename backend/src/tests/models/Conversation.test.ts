import { Conversation, User } from '../../models';
import { Types } from 'mongoose';
import '../setup';

describe('Conversation Model', () => {
  const VALID_PASSWORD_HASH =
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  let userId: Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: VALID_PASSWORD_HASH,
    });
    userId = user._id;
  });

  describe('Schema Validation', () => {
    it('should create a valid conversation', async () => {
      const conversation = await Conversation.create({
        user_id: userId,
        title: 'Test Conversation',
      });

      expect(conversation._id).toBeDefined();
      expect(conversation.user_id.toString()).toBe(userId.toString());
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.started_at).toBeDefined();
      expect(conversation.archived).toBe(false);
      expect(conversation.deleted).toBe(false);
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.message_count).toBe(0);
    });

    it('should fail without required user_id', async () => {
      const conversation = new Conversation({
        title: 'Test Conversation',
      });

      await expect(conversation.save()).rejects.toThrow();
    });

    it('should use default title', async () => {
      const conversation = await Conversation.create({
        user_id: userId,
      });

      expect(conversation.title).toBe('New Conversation');
    });
  });

  describe('Message Operations', () => {
    it('should add a message to conversation', async () => {
      const conversation = await Conversation.create({
        user_id: userId,
        title: 'Test Conversation',
      });

      conversation.addMessage('user', 'Hello, AI!');
      await conversation.save();

      expect(conversation.messages).toHaveLength(1);
      expect(conversation.messages[0].sender).toBe('user');
      expect(conversation.messages[0].text).toBe('Hello, AI!');
      expect(conversation.messages[0].timestamp).toBeDefined();
      expect(conversation.message_count).toBe(1);
      expect(conversation.last_message_at).toBeDefined();
    });

    it('should add multiple messages', async () => {
      const conversation = await Conversation.create({
        user_id: userId,
      });

      conversation.addMessage('user', 'Hello!');
      conversation.addMessage('ai', 'Hi there!');
      conversation.addMessage('user', 'How are you?');
      await conversation.save();

      expect(conversation.messages).toHaveLength(3);
      expect(conversation.message_count).toBe(3);
    });

    it('should get recent messages', async () => {
      const conversation = await Conversation.create({
        user_id: userId,
      });

      // Add 25 messages
      for (let i = 0; i < 25; i++) {
        conversation.addMessage('user', `Message ${i}`);
      }
      await conversation.save();

      const recentMessages = conversation.getRecentMessages(10);
      expect(recentMessages).toHaveLength(10);
      expect(recentMessages[9].text).toBe('Message 24');
    });
  });
});

import { Conversation, IConversation, User } from '../models';
import { Types } from 'mongoose';
import { UserService } from './userService';

// Service class for managing conversations
export class ConversationService {
  static async createConversation(
    userId: string | Types.ObjectId,
    title: string = 'New Conversation',
  ): Promise<IConversation> {
    const conversation = new Conversation({
      user_id: userId,
      title,
      started_at: new Date(),
      archived: false,
      messages: [],
      message_count: 0,
    });

    await conversation.save();
    await UserService.addConversationToUser(userId, conversation._id);

    return conversation;
  }

  // Get a conversation by ID, ensuring it belongs to the specified user
  static async getConversationById(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOne({
      _id: conversationId,
      user_id: userId,
    });
  }

  // Get a conversation by ID and populate all messages (for admin or detailed view)
  static async getConversationWithRecentMessages(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    messageLimit: number = 20,
    beforeCursor?: string
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user_id: userId,
    });

    if (!conversation) return null;

    // If a beforeCursor is provided, filter out newer messages
    if (beforeCursor) {
      const beforeTime = new Date(beforeCursor).getTime();
      conversation.messages = conversation.messages.filter(
        (msg: any) => new Date(msg.timestamp).getTime() < beforeTime
      ) as any;
    }

    // Limit the number of messages returned to the most recent ones
    if (conversation.messages.length > messageLimit) {
      conversation.messages = conversation.messages.slice(-messageLimit) as any;
    }

    return conversation;
  }

  // Get all conversations for a user, with optional filtering for archived conversations
  static async getUserConversations(
    userId: string | Types.ObjectId,
    includeArchived: boolean = false,
  ): Promise<IConversation[]> {
    const query: any = {
      user_id: userId,
      deleted: false,
    };

    if (!includeArchived) {
      query.archived = false;
    }

    return Conversation.find(query)
      .sort({ last_message_at: -1 })
      .select('-messages');
  }

  // Get paginated conversations for a user, with optional filtering for archived conversations
  // This is used for the mobile app to efficiently load conversations without fetching all messages or metadata.
  static async getUserConversationsPaginated(
    userId: string | Types.ObjectId,
    includeArchived: boolean = false,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ conversations: Partial<IConversation>[]; total: number }> {
    const query: any = { user_id: userId, deleted: false };
    if (!includeArchived) query.archived = false;

    const skip = (page - 1) * pageSize;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ last_message_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .select('_id title last_message_at message_count archived createdAt'),
      Conversation.countDocuments(query),
    ]);

    return { conversations, total };
  }

  // Add a message to a conversation and update the last_message_at timestamp
  static async addMessage(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    sender: 'user' | 'ai',
    text: string,
  ): Promise<IConversation> {
    const conversation = await this.getConversationById(conversationId, userId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.addMessage(sender, text);
    await conversation.save();

    return conversation;
  }

  // Update the title of a conversation
  static async updateTitle(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    title: string,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { title } },
      { returnDocument: 'after', runValidators: true }, 
    );
  }

  // Archive a conversation (soft delete)
  static async archiveConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { archived: true } },
      { returnDocument: 'after' },
    );
  }

  // Unarchive a conversation
  static async unarchiveConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { archived: false } },
      { returnDocument: 'after' },
    );
  }

  // Soft delete a conversation and remove its reference from the user's conversations array
  static async deleteConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    const deleted = await Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { deleted: true } },
      { new: true },
    );
    if (deleted) {
      await User.findByIdAndUpdate(userId, { $pull: { conversations: deleted._id } }); 
    }
    return deleted;
  }

  // Get conversation statistics such as total messages, user vs AI messages, liked messages, and conversation duration
  static async getConversationStats(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ) {
    const conversation = await this.getConversationById(conversationId, userId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const userMessages = conversation.messages.filter(
      (m) => m.sender === 'user',
    );
    const aiMessages = conversation.messages.filter((m) => m.sender === 'ai');
    const likedMessages = conversation.messages.filter((m) => m.metadata.liked);

    return {
      total_messages: conversation.message_count,
      user_messages: userMessages.length,
      ai_messages: aiMessages.length,
      liked_messages: likedMessages.length,
      started_at: conversation.started_at,
      last_message_at: conversation.last_message_at,
      duration_minutes: conversation.last_message_at
        ? Math.floor(
          (conversation.last_message_at.getTime() -
            conversation.started_at.getTime()) /
          60000,
        )
        : 0,
    };
  }
}
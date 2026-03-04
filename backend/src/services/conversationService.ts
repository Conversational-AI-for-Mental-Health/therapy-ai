import { Conversation, IConversation } from '../db/models';
import { Types } from 'mongoose';
import { UserService } from './userService';

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

  static async getConversationById(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOne({
      _id: conversationId,
      user_id: userId,
    });
  }

  static async getConversationWithRecentMessages(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    messageLimit: number = 20,
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user_id: userId,
    });

    if (!conversation) return null;

    // Manually slice messages to get recent ones
    if (conversation.messages.length > messageLimit) {
      conversation.messages = conversation.messages.slice(-messageLimit) as any;
    }

    return conversation;
  }

  static async getUserConversations(
    userId: string | Types.ObjectId,
    includeArchived: boolean = false,
  ): Promise<IConversation[]> {
    const query: any = {
      user_id: userId,
    };

    if (!includeArchived) {
      query.archived = false;
    }

    return Conversation.find(query)
      .sort({ last_message_at: -1 })
      .select('-messages');
  }

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

  static async updateTitle(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    title: string,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { title } },
      { new: true, runValidators: true },
    );
  }

  static async archiveConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { archived: true } },
      { new: true },
    );
  }

  static async unarchiveConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { $set: { archived: false } },
      { new: true },
    );
  }

  static async deleteConversation(
    conversationId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<IConversation | null> {
    return Conversation.findOneAndDelete({ _id: conversationId, user_id: userId });
  }

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

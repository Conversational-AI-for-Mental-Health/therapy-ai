import { Request, Response } from 'express';
import axios from 'axios';
import { Types } from 'mongoose';
import config from '../config';
import { ConversationService } from '../services/conversationService';

interface ChatRequestBody {
  userId?: string;
  conversationId?: string;
  message: string;
}

/**
 * POST /api/chat
 * Handles a chat turn:
 *  - ensures a User and Conversation exist
 *  - saves the user message
 *  - sends the message to the Python LLM backend
 *  - saves the bot (LLM) message
 *  - returns the bot reply + conversationId
 */
export const handleChat = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId, message } = req.body as ChatRequestBody;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'message' field." });
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Missing or invalid 'userId' field.",
      });
    }

    const normalizedUserId = new Types.ObjectId(userId);

    let activeConversationId: Types.ObjectId;

    if (conversationId && Types.ObjectId.isValid(conversationId)) {
      activeConversationId = new Types.ObjectId(conversationId);
    } else {
      const created = await ConversationService.createConversation(
        normalizedUserId,
        message.slice(0, 50),
      );
      activeConversationId = created._id;
    }

    await ConversationService.addMessage(
      activeConversationId,
      normalizedUserId,
      'user',
      message,
    );

    let botText: string;
    const latestConversation =
      await ConversationService.getConversationWithRecentMessages(
        activeConversationId,
        normalizedUserId,
        20,
      );

    if (!latestConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    const conversationHistory = latestConversation.messages
      .slice(0, -1)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    try {
      const response = await axios.post(
        config.PYTHON_AI_URL,
        {
          message,
          conversation_history: conversationHistory,
          max_tokens: 512,
          temperature: 0.7,
        },
        { timeout: config.PYTHON_AI_TIMEOUT_MS },
      );
      botText =
        response.data.response ?? "I'm having trouble understanding right now.";
    } catch (err) {
      console.error('[CHAT] Error calling Python LLM backend:', err);
      botText =
        "I'm sorry, but I'm unable to reach the AI service at the moment.";
    }

    const updatedConversation = await ConversationService.addMessage(
      activeConversationId,
      normalizedUserId,
      'ai',
      botText,
    );
    const botMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    return res.json({
      conversationId: activeConversationId,
      botMessage: {
        id: botMessage._id.toString(),
        role: botMessage.sender,
        text: botMessage.text,
        createdAt: botMessage.timestamp,
      },
    });
  } catch (error) {
    console.error('[CHAT] Error in handleChat:', error);
    return res.status(500).json({
      error: 'Failed to process chat message.',
    });
  }
};

import { Server as SocketIOServer, Socket } from 'socket.io';
import { ConversationService } from './services';
import axios from 'axios';
import config from './config';
import jwt from 'jsonwebtoken';

type SocketAuthPayload = {
  token?: string;
  userId?: string;
};

type AuthenticatedSocket = Socket & {
  data: {
    userId: string;
  };
};

const getUserIdFromSocket = (socket: AuthenticatedSocket): string => socket.data.userId;

const resolveSocketUserId = (auth: SocketAuthPayload): string | null => {
  const token = auth.token?.startsWith('Bearer ')
    ? auth.token.slice(7)
    : auth.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: string;
      };
      if (decoded?.userId && typeof decoded.userId === 'string') {
        return decoded.userId;
      }
    } catch (error) {
      return null;
    }
  }

  if (config.NODE_ENV !== 'production' && auth.userId) {
    return auth.userId;
  }

  return null;
};

// Handle incoming user messages, call Python AI, and broadcast responses
const handleUserMessage = async (
  socket: AuthenticatedSocket,
  io: SocketIOServer,
  data: { conversationId?: string; text: string },
) => {
  const userId = getUserIdFromSocket(socket);

  console.log(
    `[Socket] send_message from user ${userId} in conversation ${data.conversationId || '(new)'}`,
  );

  try {
    // 1. Validate message text
    if (!data.text || data.text.trim().length === 0) {
      socket.emit('error', { message: 'Message text cannot be empty' });
      return;
    }
    if (data.text.trim().length > 10000) {
      socket.emit('error', { message: 'Message is too long. Please keep messages under 10,000 characters.' });
      return;
    }

    // 2. If no conversationId, create a new conversation
    let conversationId = data.conversationId;

    if (!conversationId) {
      const newConversation = await ConversationService.createConversation(
        userId,
        data.text.trim().slice(0, 50),
      );
      conversationId = newConversation._id.toString();

      socket.emit('conversation_created', {
        conversationId,
        title: newConversation.title,
      });
      socket.join(conversationId);
      console.log(`[Socket] Created new conversation ${conversationId} for user ${userId}`);
    }

    // 3. Save user message to database
    await ConversationService.addMessage(
      conversationId,
      userId,
      'user',
      data.text.trim(),
    );

    console.log('[Socket] User message saved to database');

    // 4. Fetch conversation with recent messages for AI context
    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        conversationId,
        userId,
        20,
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    // 5. Prepare conversation history for AI (exclude the current user message)
    const conversationHistory = conversation.messages
      .slice(0, -1)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    console.log(
      `[Socket] Calling Python AI with ${conversationHistory.length} previous messages`,
    );

    // 6. Call Python AI service
    let aiResponse: string;
    let aiCallSucceeded = true;
    try {
      const response = await axios.post(
        config.PYTHON_AI_URL,
        {
          message: data.text.trim(),
          conversation_history: conversationHistory,
          max_tokens: 512,
          temperature: 0.7,
          system_prompt: "You are Kai, an empathetic AI companion for mental health support. Listen carefully, validate feelings, ask open-ended questions. Never give medical advice. Keep responses concise.",
        },
        { timeout: config.PYTHON_AI_TIMEOUT_MS },
      );

      aiResponse =
        response.data.response ||
        response.data.message ||
        'No response from AI';

      console.log(
        '[Socket] Received AI response:',
        aiResponse.substring(0, 50) + '...',
      );
    } catch (aiError: any) {
      console.error('[Socket] Python AI error:', aiError.message);
      aiCallSucceeded = false;
      aiResponse =
        "I'm having trouble connecting to my AI service. Please try again in a moment.";
    }

    // 7. Save AI response to database
    await ConversationService.addMessage(
      conversationId,
      userId,
      'ai',
      aiResponse,
    );

    console.log('[Socket] AI message saved to database');

    // 8. Broadcast AI response immediately
    io.to(conversationId).emit('receive_message', {
      conversationId,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    });

    console.log('[Socket] AI response sent to room:', conversationId);

    // 9. Asynchronously generate dynamic quick prompts after a successful AI response.
    if (aiCallSucceeded) {
      (async () => {
        try {
          const promptsResponse = await axios.post(
            config.PYTHON_AI_URL,
            {
              message:
                'Based on this conversation, suggest exactly 3 short things the USER might want to say next, written in first person as if the user is speaking (e.g. "I feel overwhelmed", "What can I do?", "I need help"). Each must be 3-5 words maximum. Return ONLY a JSON array of 3 strings, no other text.',
              conversation_history: [
                ...conversationHistory,
                { role: 'assistant', content: aiResponse },
              ],
              max_tokens: 60,
              temperature: 0.7,
              system_prompt:
                "You generate short follow-up messages written from the USER's perspective in first person - things the user might type next, not things the AI would say. Respond ONLY with a valid JSON array of exactly 3 strings, each 3-5 words. No preamble, no explanation.",
            },
            { timeout: config.PYTHON_SUGGESTED_PROMPTS_TIMEOUT_MS },
          );

          const raw: string = promptsResponse.data.response || promptsResponse.data.message || '[]';
          const cleaned = raw.replace(/```json|```/g, '').trim();
          const parsed: unknown = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            const prompts = (parsed as unknown[])
              .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
              .slice(0, 3);

            if (prompts.length > 0) {
              io.to(conversationId).emit('suggested_prompts', {
                conversationId,
                prompts,
              });
              console.log('[Socket] Suggested prompts sent to room:', conversationId);
            }
          }
        } catch (promptErr: any) {
          console.warn('[Socket] Failed to generate suggested prompts:', promptErr.message);
        }
      })();
    }
  } catch (error: any) {
    console.error('[Socket] Error handling message:', error.message);
    socket.emit('error', {
      message: 'Failed to process message. Please try again.',
    });
  }
};

// Handle client joining a conversation room and send conversation history
const handleJoinConversation = async (
  socket: AuthenticatedSocket,
  data: { conversationId: string },
) => {
  const userId = getUserIdFromSocket(socket);

  console.log(
    `[Socket] join_conversation: user ${userId} joining conversation ${data.conversationId}`,
  );

  try {
    if (!data.conversationId) {
      socket.emit('error', { message: 'Missing conversationId' });
      return;
    }

    socket.join(data.conversationId);
    console.log(
      `[Socket] Client ${socket.id} joined room: ${data.conversationId}`,
    );

    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        data.conversationId,
        userId,
        50,
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    socket.emit('conversation_history', {
      conversationId: data.conversationId,
      messages: conversation.messages || [],
    });

    console.log(
      `[Socket] Sent ${conversation.messages?.length || 0} messages to client ${socket.id}`,
    );
  } catch (error: any) {
    console.error('[Socket] Error joining conversation:', error.message);
    socket.emit('error', {
      message: 'Failed to join conversation',
    });
  }
};

// Export the function to attach socket handlers, which will be called in server.ts
export const attachSocketHandlers = (io: SocketIOServer) => {
  io.use((socket, next) => {
    const userId = resolveSocketUserId((socket.handshake.auth || {}) as SocketAuthPayload);
    if (!userId) {
      return next(new Error('Unauthorized'));
    }
    (socket as AuthenticatedSocket).data.userId = userId;
    return next();
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`[Socket] Client connected: ${socket.id} (user: ${socket.data.userId})`);

    socket.on(
      'join_conversation',
      async (data: { conversationId: string }) => {
        await handleJoinConversation(authSocket, data);
      },
    );

    socket.on(
      'send_message',
      async (data: { conversationId?: string; text: string }) => {
        await handleUserMessage(authSocket, io, data);
      },
    );

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
  });

  console.log('Socket.io handlers attached (JWT auth enabled)');
};
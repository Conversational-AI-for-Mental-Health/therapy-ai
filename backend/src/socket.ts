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

const handleUserMessage = async (
  socket: AuthenticatedSocket,
  io: SocketIOServer,
  data: { conversationId: string; text: string },
) => {
  const userId = getUserIdFromSocket(socket);
  console.log(
    `[Socket] send_message from user ${userId} in conversation ${data.conversationId}`,
  );

  try {
    // validate input
    if (!data.text || data.text.trim().length === 0) {
      socket.emit('error', { message: 'Message text cannot be empty' });
      return;
    }

    // save user message
    await ConversationService.addMessage(
      data.conversationId,
      userId,
      'user',
      data.text,
    );

    console.log('[Socket] User message saved to database');

    // get recent conversation context
    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        data.conversationId,
        userId,
        20, // last 20 messages
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    // build history for python ai
    // skip the latest user message
    const conversationHistory = conversation.messages
      .slice(0, -1) // remove last user message
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    console.log(
      `[Socket] Calling Python AI with ${conversationHistory.length} previous messages`,
    );

    // call python ai with history
    let aiResponse: string;
    try {
      const response = await axios.post(
        config.PYTHON_AI_URL,
        {
          message: data.text,
          conversation_history: conversationHistory, // send full history
          max_tokens: 512,
          temperature: 0.7,
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
      aiResponse =
        "I'm having trouble connecting to my AI service. Please try again in a moment.";
    }

    // save ai response
    await ConversationService.addMessage(
      data.conversationId,
      userId,
      'ai',
      aiResponse,
    );

    console.log('[Socket] AI message saved to database');

    // emit ai response
    io.to(data.conversationId).emit('receive_message', {
      conversationId: data.conversationId,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    });

    console.log('[Socket] AI response sent to room:', data.conversationId);
  } catch (error: any) {
    console.error('[Socket] Error handling message:', error.message);
    socket.emit('error', {
      message: 'Failed to process message. Please try again.',
    });
  }
};

//join convo
const handleJoinConversation = async (
  socket: AuthenticatedSocket,
  data: { conversationId: string },
) => {
  const userId = getUserIdFromSocket(socket);
  console.log(
    `[Socket] join_conversation: user ${userId} joining conversation ${data.conversationId}`,
  );

  try {
    // validate input
    if (!data.conversationId) {
      socket.emit('error', { message: 'Missing conversationId' });
      return;
    }

    // join room
    socket.join(data.conversationId);
    console.log(
      `[Socket] Client ${socket.id} joined room: ${data.conversationId}`,
    );

    // get conversation with messages
    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        data.conversationId,
        userId,
        50, // last 50 messages
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    // send history to this client
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

//attach socket event handlers
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
    console.log(`[Socket] Client connected: ${socket.id}`);

    // listen for join_conversation
    socket.on(
      'join_conversation',
      async (data: { conversationId: string }) => {
        await handleJoinConversation(authSocket, data);
      },
    );

    // listen for send_message
    socket.on(
      'send_message',
      async (data: {
        conversationId: string;
        text: string;
      }) => {
        await handleUserMessage(authSocket, io, data);
      },
    );

    // handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    // handle errors
    socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
  });

  console.log('Socket.io handlers attached');
};

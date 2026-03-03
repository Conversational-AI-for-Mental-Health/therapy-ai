import { Server as SocketIOServer, Socket } from 'socket.io';
import { ConversationService } from './services';
import axios from 'axios';
import config from './config';
import { UserService } from './services/userService';

/**
 * Handle user sending a message
 */
const handleUserMessage = async (
  socket: Socket,
  io: SocketIOServer,
  data: { conversationId: string; text: string; userId: string },
) => {
  console.log(
    `[Socket] send_message from user ${data.userId} in conversation ${data.conversationId}`,
  );

  try {
    // 1. Validate input
    if (!data.text || data.text.trim().length === 0) {
      socket.emit('error', { message: 'Message text cannot be empty' });
      return;
    }

    // 2. Save user message to database
    await ConversationService.addMessage(
      data.conversationId,
      data.userId,
      'user',
      data.text,
    );

    console.log('[Socket] User message saved to database');

    // 3. Get conversation history for context
    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        data.conversationId,
        data.userId,
        20, // Last 20 messages for context
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    // 4. Format conversation history for Python AI
    // Exclude the message we just added
    const conversationHistory = conversation.messages
      .slice(0, -1) // Remove last message (the one we just added)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    console.log(
      `[Socket] Calling Python AI with ${conversationHistory.length} previous messages`,
    );

    // 5. Call Python AI backend with conversation history
    let aiResponse: string;
    try {
      const response = await axios.post(
        config.PYTHON_AI_URL,
        {
          message: data.text,
          conversation_history: conversationHistory, // Send full history
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

    // 6. Save AI response to database
    await ConversationService.addMessage(
      data.conversationId,
      data.userId,
      'ai',
      aiResponse,
    );

    console.log('[Socket] AI message saved to database');

    // 7. Send AI response back to user
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

/**
 * Handle joining a conversation room
 */
const handleJoinConversation = async (
  socket: Socket,
  data: { conversationId: string; userId: string },
) => {
  console.log(
    `[Socket] join_conversation: user ${data.userId} joining conversation ${data.conversationId}`,
  );

  try {
    // Validate input
    if (!data.conversationId || !data.userId) {
      socket.emit('error', { message: 'Missing conversationId or userId' });
      return;
    }

    // Join the Socket.io room
    socket.join(data.conversationId);
    console.log(
      `[Socket] Client ${socket.id} joined room: ${data.conversationId}`,
    );

    // Get conversation with messages
    const conversation =
      await ConversationService.getConversationWithRecentMessages(
        data.conversationId,
        data.userId,
        50, // Last 50 messages
      );

    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }

    // Send conversation history to this client only
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
      error: error.message,
    });
  }
};

/**
 * Attach socket event handlers
 */
export const attachSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Listen for join_conversation event
    socket.on(
      'join_conversation',
      async (data: { conversationId: string; userId: string }) => {
        await handleJoinConversation(socket, data);
      },
    );

    // Listen for send_message event
    socket.on(
      'send_message',
      async (data: {
        conversationId: string;
        text: string;
        userId: string;
      }) => {
        await handleUserMessage(socket, io, data);
      },
    );

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
  });

  console.log('Socket.io handlers attached');
};

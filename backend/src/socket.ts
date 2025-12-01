import { Server as SocketIOServer, Socket } from 'socket.io';
import axios from 'axios';
import { Types } from 'mongoose';
import { Conversation } from './models';
import { IMessage } from './models/Message';
import config from './config';
import { UserService } from './services/userService';


const AI_API_URL = `${config.AI_SERVICE_URL}/chat`;

/**
  Handles an incoming user message.
  1. Creates and saves the user message to the DB.
  2. Fetches conversation history.
  3. Calls the Python AI service with the message and history.
  4. Saves the AI's response to the DB.
  5. Emits the AI's response back to the client.
 */
const getUserIdFromSocket = (socket: Socket) => {
  const incomingUserId = socket.handshake.auth?.userId as string | undefined;
  if (incomingUserId && Types.ObjectId.isValid(incomingUserId)) {
    return incomingUserId;
  }

  // Fallback to the same placeholder as the HTTP auth middleware
  return '507f1f77bcf86cd799439011';
};

const handleUserMessage = async (
  socket: Socket,
  payload: { text: string; conversationId?: string },
) => {
  const { text, conversationId } = payload;
  console.log(`[Socket] Received message: ${text}`);

  try {
    const userId = getUserIdFromSocket(socket);

    // find convo
    let conversation = null;

    if (conversationId && Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: userId,
        archived: false,
      });
    }
    const historyForAI = conversation
      ? conversation.messages.map((msg) => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.text,
        }))
      : [];
    const aiResponse = await axios.post(AI_API_URL, {
      message: text,
      conversation_history: historyForAI,
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiText = aiResponse.data.response as string;
    const formattedAiText = aiText.trim().replace(/\n{3,}/g, '\n\n');
    let isNewConversation = false;
    if (!conversation) {
      isNewConversation = true;
      // Generate title from user's message
      const titleFromMessage = text.length > 30 ? text.substring(0, 30) + '...' : text;
      conversation = new Conversation({
        user_id: userId,
        title: titleFromMessage,
        messages: [],
        message_count: 0,
      });
    }
    const userMessage: IMessage = {
      sender: 'user',
      text,
      timestamp: new Date(),
      metadata: {
        liked: false,
        copied: false,
        regenerated: false,
        edited: false,
      },
    } as any;
    conversation.messages.push(userMessage);

    const botMessage: IMessage = {
      sender: 'ai',
      text: formattedAiText,
      timestamp: new Date(),
      metadata: {
        liked: false,
        copied: false,
        regenerated: false,
        edited: false,
      },
    } as any;
    conversation.messages.push(botMessage);
    
    conversation.message_count = conversation.messages.length;
    conversation.last_message_at = new Date();
    await conversation.save();

    // cponersation added to user
    if (isNewConversation) {
        await UserService.addConversationToUser(userId, conversation._id);
    }

    // emit bot message to update state
    const responsePayload = {
      ...botMessage,
      conversationId: conversation._id
    };
    socket.emit('botMessage', responsePayload);
  } catch (error:any) {
    console.error('[Socket] Error handling message:', error?.message);
    socket.emit('botMessage', {
      sender: 'ai',
      text: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date(),
    });
  }
};

export const attachSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('userMessage', async (msg: { text: string; conversationId?: string }) => {
      await handleUserMessage(socket, msg);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io handlers attached');
};


// const handleUserMessage = async (socket: Socket, text: string) => {
//   console.log(`[Socket] Received message: ${text}`);

//   // --- PLACEHOLDER LOGIC ---
//   const botResponse = {
//     text: `(ECHO): "${text}". Backend connection confirmed!`,
//     isBot: true,
//   };

//   socket.emit("botMessage", botResponse);
// };

// export const attachSocketHandlers = (io: SocketIOServer) => {
//   io.on("connection", (socket) => {
//     console.log(`[Socket] User connected: ${socket.id}`);

//     socket.emit("botMessage", {
//       text: "Welcome! Backend is active.",
//       isBot: true,
//     });

//     socket.on("userMessage", async (msg: { text: string }) => {
//       await handleUserMessage(socket, msg.text);
//     });

//     socket.on("disconnect", () => {
//       console.log(`[Socket] User disconnected: ${socket.id}`);
//     });
//   });
// };

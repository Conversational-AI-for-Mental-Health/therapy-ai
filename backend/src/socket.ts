import { Server as SocketIOServer, Socket } from 'socket.io';
import axios from 'axios';
import { Conversation, IMessage } from './models/Conversation';
import config from './config';


const AI_API_URL = `${config.AI_SERVICE_URL}/chat`;

/**
  Handles an incoming user message.
  1. Creates and saves the user message to the DB.
  2. Fetches conversation history.
  3. Calls the Python AI service with the message and history.
  4. Saves the AI's response to the DB.
  5. Emits the AI's response back to the client.
 */
const handleUserMessage = async (socket: Socket, text: string) => {
  console.log(`[Socket] Received message: ${text}`);

  try {
    // 1. Find conversation or create a new one
    let conversation = await Conversation.findOne({ socketId: socket.id, isArchived: false });
    if (!conversation) {
      conversation = new Conversation({ socketId: socket.id, messages: [] });
    }

    // 2. Create and save user message (Feature 3: Timestamping)
    const userMessage: IMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // 3. Prepare history for AI service (Feature 1: State)
    // AI service expects { role, content }
    const historyForAI = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 4. Call Python AI service
    const aiResponse = await axios.post(AI_API_URL, {
      message: text,
      conversation_history: historyForAI.slice(0, -1), // Send all *except* the new message
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiText = aiResponse.data.response;

    // 5. Create and save bot message (Features 2 & 3)
    const botMessage: IMessage = {
      role: 'assistant',
      content: aiText,
      timestamp: new Date(),
    };
    conversation.messages.push(botMessage);
    await conversation.save(); // Save full conversation

    // 6. Emit *only* the new bot message
    socket.emit('botMessage', botMessage);

  } catch (error:any) {
    console.error('[Socket] Error handling message:', error?.message);
    socket.emit('botMessage', {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date(),
    });
  }
};

export const attachSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Send a welcome message
    socket.emit('botMessage', {
      role: 'assistant',
      content: 'Welcome! How can I help you today?',
      timestamp: new Date(),
    });

    socket.on('userMessage', async (msg: { text: string }) => {
      await handleUserMessage(socket, msg.text);
    });
  }
};

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  console.log(' Socket.io handlers attached');
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

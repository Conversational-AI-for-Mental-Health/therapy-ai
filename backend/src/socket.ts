import { Server as SocketIOServer, Socket } from "socket.io";

const handleUserMessage = async (socket: Socket, text: string) => {
  console.log(`[Socket] Received message: ${text}`);

  // --- PLACEHOLDER LOGIC ---
  const botResponse = {
    text: `(ECHO): "${text}". Backend connection confirmed!`,
    isBot: true,
  };

  socket.emit("botMessage", botResponse);
};

export const attachSocketHandlers = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.emit("botMessage", {
      text: "Welcome! Backend is active.",
      isBot: true,
    });

    socket.on("userMessage", async (msg: { text: string }) => {
      await handleUserMessage(socket, msg.text);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

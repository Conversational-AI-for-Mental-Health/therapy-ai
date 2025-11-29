import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private userId: string = '507f1f77bcf86cd799439011'; // Placeholder user ID - replace with real auth

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId: this.userId,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  // Send a message (conversationId is optional for now; backend will create if missing)
  sendMessage(conversationId: string | null, text: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('Sending message:', { conversationId, text });
    this.socket.emit('userMessage', {
      conversationId,
      text,
    });
  }

  // Listen for AI responses
  onAIMessage(callback: (data: any) => void) {
    this.socket?.on('botMessage', callback);
  }

  // Listen for errors
  onError(callback: (error: any) => void) {
    this.socket?.on('error', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();

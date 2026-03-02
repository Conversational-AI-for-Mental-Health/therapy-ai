import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  
  private getUserId(): string {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id;
      }
    } catch (e) {
      console.error('Failed to get user ID:', e);
    }
    return '507f1f77bcf86cd799439011'; // Fallback to placeholder if no user found (though user should be logged in)
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const userId = this.getUserId();

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId: userId,
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
  sendMessage(conversationId: string, text: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    const userId = this.getUserId();

    console.log('Sending message:', { conversationId, text });
    this.socket.emit('send_message', {
      conversationId,
      text,
      userId,
    });
  }

  // Join a backend conversation room to receive room emits
  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    const userId = this.getUserId();
    this.socket.emit('join_conversation', { conversationId, userId });
  }

  // Listen for AI responses
  onAIMessage(callback: (data: any) => void) {
    this.socket?.on('receive_message', callback);
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

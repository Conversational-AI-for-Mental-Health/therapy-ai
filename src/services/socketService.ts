import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../constants/constants';

class SocketService {
  private socket: Socket | null = null;
  private activeConversationId: string | null = null;

  private async getAuthToken(): Promise<string | null> {
    return SecureStore.getItemAsync('token');
  }

  async connect() {
    if (this.socket?.connected) return;

    const token = await this.getAuthToken();
    if (!token) {
      console.warn('Missing auth token. Socket connection skipped.');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: `Bearer ${token}` },
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected:', this.socket?.id);
      if (this.activeConversationId) {
        this.socket?.emit('join_conversation', { conversationId: this.activeConversationId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.activeConversationId = null;
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  setActiveConversation(conversationId: string) {
    this.activeConversationId = conversationId;
  }

  sendMessage(conversationId: string | null, text: string) {
    if (!this.socket?.connected) throw new Error('Socket not connected');
    this.socket.emit('send_message', { conversationId, text });
  }

  onAIMessage(callback: (data: any) => void) {
    this.socket?.on('receive_message', callback);
  }

  onConversationHistory(callback: (data: any) => void) {
    this.socket?.on('conversation_history', callback);
  }

  onError(callback: (error: any) => void) {
    this.socket?.on('error', callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
    this.socket?.on('connect', () => {
      if (this.activeConversationId) {
        this.socket?.emit('join_conversation', { conversationId: this.activeConversationId });
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();

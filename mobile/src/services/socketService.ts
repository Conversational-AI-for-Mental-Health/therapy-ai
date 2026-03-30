//  Socket disabled for demo (no backend required)

class SocketService {
    private activeConversationId: string | null = null;
  
    async connect() {
      console.log("🟢 Mock socket connected (demo mode)");
    }
  
    disconnect() {
      console.log("🔴 Mock socket disconnected");
      this.activeConversationId = null;
    }
  
    joinConversation(conversationId: string) {
      this.activeConversationId = conversationId;
      console.log("📩 Joined conversation:", conversationId);
    }
  
    setActiveConversation(conversationId: string) {
      this.activeConversationId = conversationId;
    }
  
    sendMessage(conversationId: string | null, text: string) {
      console.log("💬 Mock send message:", text);
    }
  
    onAIMessage(callback: (data: any) => void) {
      // simulate AI response (optional)
      setTimeout(() => {
        callback({
          text: "I understand how you're feeling. I'm here to help 💙",
        });
      }, 800);
    }
  
    onConversationHistory(callback: (data: any) => void) {
      callback([]);
    }
  
    onError(callback: (error: any) => void) {
      // no errors in demo
    }
  
    removeAllListeners() {
      console.log("🧹 Mock listeners cleared");
    }
  
    isConnected(): boolean {
      return true;
    }
  
    getSocket() {
      return null;
    }
  }
  
  export default new SocketService();
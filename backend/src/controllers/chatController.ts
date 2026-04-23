import { Request, Response } from "express";
import axios from "axios";
import config from "../config";
import { ConversationService } from "../services/conversationService";

const PYTHON_API_URL = config.PYTHON_AI_URL;

interface ChatRequestBody {
  conversationId?: string;
  message: string;
}

// Main chat handler - processes user messages, interacts with AI backend, and manages conversation state
export const handleChat = async (req: Request, res: Response) => {
  try {
    // 0) Authentication check
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1) Validate input
    const { conversationId, message } = req.body as ChatRequestBody;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Missing or invalid 'message' field." });
    }

    // Limit message length to prevent abuse
    if (message.trim().length > 10000) {
      return res.status(400).json({ success: false, error: 'Message is too long. Maximum 10,000 characters.' });
    }

    // 2) Fetch or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ConversationService.getConversationById(conversationId, userId);
    }

    if (!conversation) {
      conversation = await ConversationService.createConversation(
        userId,
        message.trim().slice(0, 50)
      );
    }

    // Add user message to conversation
    conversation = await ConversationService.addMessage(
      conversation._id,
      userId,
      "user",
      message.trim()
    );

    // 3) Prepare conversation history for AI backend (last 20 messages)
    const history = conversation.messages
      .slice(-21, -1)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    // 4) Call Python AI backend
    let botText: string;
    try {
      const response = await axios.post(
        PYTHON_API_URL,
        {
          message: message.trim(),
          conversation_history: history,
          max_tokens: 512,
          temperature: 0.7,
          system_prompt: "You are Kai, an empathetic AI companion for mental health support. Listen carefully, validate feelings, ask open-ended questions. Never give medical advice. Keep responses concise.",
        },
        { timeout: config.PYTHON_AI_TIMEOUT_MS }
      );
      botText = response.data.response ?? "I'm having trouble understanding right now.";
    } catch (err) {
      console.error("[CHAT] Error calling Python AI backend:", err);
      botText = "I'm sorry, I'm unable to reach the AI service at the moment. Please try again.";
    }

    // 5) Save bot response to conversation
    conversation = await ConversationService.addMessage(
      conversation._id,
      userId,
      "ai",
      botText
    );

    // Get the latest bot message (the one we just added)
    const botMessage = conversation.messages[conversation.messages.length - 1];

    // 6) Return response to client
    return res.json({
      success: true,
      conversationId: conversation._id,
      botMessage: {
        id: botMessage._id,
        sender: botMessage.sender,
        text: botMessage.text,
        timestamp: botMessage.timestamp,
      },
    });
  } catch (error) {
    console.error('[CHAT] Error in handleChat:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to process chat message.",
    });
  }
};

// Separate handler for mobile clients - includes conversation title and indicates if it's a new conversation
export const handleMobileChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { conversationId, message } = req.body as ChatRequestBody;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Missing or invalid 'message' field." });
    }
    if (message.trim().length > 10000) {
      return res.status(400).json({ success: false, error: "Message is too long. Maximum 10,000 characters." });
    }

    // Fetch existing conversation or create new one
    let conversation;
    let isNewConversation = false;

    if (conversationId) {
      conversation = await ConversationService.getConversationById(conversationId, userId);
    }
    if (!conversation) {
      conversation = await ConversationService.createConversation(userId, message.trim().slice(0, 50));
      isNewConversation = true;
    }

    // Add user message to conversation
    conversation = await ConversationService.addMessage(conversation._id, userId, "user", message.trim());
    const userMsg = conversation.messages[conversation.messages.length - 1];

    // Prepare conversation history for AI backend (last 20 messages)
    const history = conversation.messages
      .slice(-21, -1)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    // Call Python AI backend
    let botText: string;
    try {
      const response = await axios.post(
        PYTHON_API_URL,
        {
          message: message.trim(),
          conversation_history: history,
          max_tokens: 512,
          temperature: 0.7,
          system_prompt: "You are Kai, an empathetic AI companion for mental health support. Listen carefully, validate feelings, ask open-ended questions. Never give medical advice. Keep responses concise.",
        },
        { timeout: config.PYTHON_AI_TIMEOUT_MS }
      );
      botText = response.data.response ?? "I'm having trouble understanding right now.";
    } catch (err) {
      console.error("[CHAT] Error calling Python AI backend:", err);
      botText = "I'm sorry, I'm unable to reach the AI service at the moment. Please try again.";
    }

    // Save bot response to conversation
    conversation = await ConversationService.addMessage(conversation._id, userId, "ai", botText);
    const aiMsg = conversation.messages[conversation.messages.length - 1];

    return res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        conversationTitle: conversation.title,
        isNewConversation,
        userMessage: { id: userMsg._id, sender: userMsg.sender, text: userMsg.text, timestamp: userMsg.timestamp },
        aiMessage:   { id: aiMsg._id,  sender: aiMsg.sender,  text: aiMsg.text,  timestamp: aiMsg.timestamp  },
      },
    });
  } catch (error) {
    console.error("[CHAT] Error in handleMobileChat:", error);
    return res.status(500).json({ success: false, error: "Failed to process chat message." });
  }
};
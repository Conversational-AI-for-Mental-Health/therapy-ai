import { Request, Response } from "express";
import axios from "axios";
import { User } from "../db/models/User";
import { Conversation } from "../db/models/Conversation";
import { Message } from "../db/models/Message";
import config from "../config";

interface ChatRequestBody {
  userId?: string; // optional external identity
  conversationId?: string;
  message: string;
}

/**
 * POST /api/chat
 * Handles a chat turn:
 *  - ensures a User and Conversation exist
 *  - saves the user message
 *  - sends the message to the Python LLM backend
 *  - saves the bot (LLM) message
 *  - returns the bot reply + conversationId
 */
export const handleChat = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId, message } = req.body as ChatRequestBody;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'message' field." });
    }

    // ensure user exists
    let user = await User.findOne({ authId: userId || "dev-anonymous-user" });

    if (!user) {
      user = await User.create({
        authId: userId || "dev-anonymous-user",
        email: userId ? `${userId}@example.com` : undefined,
        name: userId || "Anonymous User",
      });
    }

    // ensure conversation exists
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        user: user._id,
        title: message.slice(0, 50),
      });
    }

    // save user message
    await Message.create({
      conversation: conversation._id,
      user: user._id,
      role: "user",
      text: message,
    });

    // call python llm
    let botText: string;

    try {
      const response = await axios.post(config.PYTHON_AI_URL, { message });
      // flask returns { response: "..." }
      botText = response.data.response ?? "I'm having trouble understanding right now.";
    } catch (err) {
      console.error("[CHAT] Error calling Python LLM backend:", err);
      // fallback reply when ai call fails
      botText = "I'm sorry, but I'm unable to reach the AI service at the moment.";
    }

    // save bot message
    const botMessage = await Message.create({
      conversation: conversation._id,
      role: "bot",
      text: botText,
    });

    // return reply
    return res.json({
      conversationId: conversation._id,
      botMessage: {
        id: botMessage._id,
        role: botMessage.role,
        text: botMessage.text,
        createdAt: botMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("[CHAT] Error in handleChat:", error);
    return res.status(500).json({
      error: "Failed to process chat message.",
      details: (error as Error).message,
    });
  }
};

import { Router } from "express";
import { handleChat, handleMobileChat } from "../controllers/chatController";
import { authenticateUser } from "../middleware/validation";

const router = Router();

// POST /api/chat
// This endpoint handles incoming chat messages from the user and generates AI responses
router.post("/", authenticateUser, handleChat);

// POST /api/chat/mobile
// This endpoint is specifically designed for mobile clients to handle chat interactions
router.post("/mobile", authenticateUser, handleMobileChat);

export default router;
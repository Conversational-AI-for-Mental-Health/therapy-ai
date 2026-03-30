import { Router } from "express";
import { handleChat } from "../controllers/chatController";
import { authenticateUser } from "../middleware/validation";

const router = Router();

// POST /api/chat
// This endpoint handles incoming chat messages from the user and generates AI responses
router.post("/", authenticateUser, handleChat);

export default router;

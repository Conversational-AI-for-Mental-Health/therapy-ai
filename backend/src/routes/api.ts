import { Router, Request, Response } from "express";
import { Conversation } from '../models/Conversation';


const apiRouter = Router();

apiRouter.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Backend API is running',
    service: 'Mental Health Chatbot API',
  });
});


// Get all non-archived conversations (for a user, eventually)
apiRouter.get('/conversations', async (req: Request, res: Response) => {
  try {
    // TODO: This should be filtered by user ID, not socketId
    const conversations = await Conversation.find({ isArchived: false }).select('-messages');
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


// Get a single conversation with all its messages
apiRouter.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Archive (soft-delete) a conversation
apiRouter.patch('/conversations/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.status(200).json({ status: 'archived', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
});



export default apiRouter;

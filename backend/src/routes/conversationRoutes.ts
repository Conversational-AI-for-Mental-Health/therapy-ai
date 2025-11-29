import { Router, Request, Response } from 'express';
import { ConversationService } from '../services';
import { authenticateUser, validateObjectId } from '../middleware/validation';

const router = Router();

router.use(authenticateUser);

// Append a message to an existing conversation
router.post(
  '/:id/messages',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const { sender, text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Message text is required',
        });
      }

      if (sender !== 'user' && sender !== 'ai') {
        return res.status(400).json({
          success: false,
          error: 'Sender must be either "user" or "ai"',
        });
      }

      const conversation = await ConversationService.addMessage(
        conversationId,
        userId,
        sender,
        text,
      );

      const latestMessage = conversation.messages[conversation.messages.length - 1];

      res.status(201).json({
        success: true,
        data: latestMessage,
        conversationId: conversation._id,
        message_count: conversation.message_count,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add message',
      });
    }
  },
);

// Create new conversation
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title } = req.body;

    const conversation = await ConversationService.createConversation(
      userId,
      title,
    );

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create conversation',
    });
  }
});

// Get all conversations
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const includeArchived = req.query.archived === 'true';

    const conversations = await ConversationService.getUserConversations(
      userId,
      includeArchived,
    );

    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch conversations',
    });
  }
});

// Get single conversation
router.get(
  '/:id',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const messageLimit = parseInt(req.query.limit as string) || 50;

      const conversation =
        await ConversationService.getConversationWithRecentMessages(
          conversationId,
          userId,
          messageLimit,
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch conversation',
      });
    }
  },
);

// Update conversation title
router.patch(
  '/:id/title',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const { title } = req.body;

      if (!title || typeof title !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Title is required',
        });
      }

      const conversation = await ConversationService.updateTitle(
        conversationId,
        userId,
        title,
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update title',
      });
    }
  },
);

// Archive conversation
router.patch(
  '/:id/archive',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const conversation = await ConversationService.archiveConversation(
        conversationId,
        userId,
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to archive conversation',
      });
    }
  },
);

// Unarchive conversation
router.patch(
  '/:id/unarchive',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const conversation = await ConversationService.unarchiveConversation(
        conversationId,
        userId,
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unarchive conversation',
      });
    }
  },
);

// Delete conversation
router.delete(
  '/:id',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const conversation = await ConversationService.deleteConversation(
        conversationId,
        userId,
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete conversation',
      });
    }
  },
);

// Get conversation statistics
router.get(
  '/:id/stats',
  validateObjectId('id'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const stats = await ConversationService.getConversationStats(
        conversationId,
        userId,
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch stats',
      });
    }
  },
);

export default router;

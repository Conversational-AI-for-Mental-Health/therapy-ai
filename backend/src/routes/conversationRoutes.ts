import { Router, Request, Response } from 'express';
import { ConversationService } from '../services';
import { authenticateUser, validateObjectId } from '../middleware/validation';
import { validateBody, validateQuery } from '../middleware/schemaValidation';
import { z } from 'zod';

const router = Router();

const addMessageBodySchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string().min(1).max(10000),
});

const createConversationBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

const getConversationQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
});

const getConversationsQuerySchema = z.object({
  archived: z.enum(['true', 'false']).optional(),
});

const updateTitleBodySchema = z.object({
  title: z.string().min(1).max(200),
});

router.use(authenticateUser);

// Add message to conversation
router.post(
  '/:id/messages',
  validateObjectId('id'),
  validateBody(addMessageBodySchema),
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

      if (sender !== 'user') {
        return res.status(400).json({
          success: false,
          error: 'Sender must be "user" — AI messages are written by the AI service only',
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
router.post('/', validateBody(createConversationBodySchema), async (req: Request, res: Response) => {
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

// Get all conversations for the user, with optional filter for archived conversations
router.get('/', validateQuery(getConversationsQuerySchema), async (req: Request, res: Response) => {
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

// Get a specific conversation by ID, including its messages (with pagination)
router.get(
  '/:id',
  validateObjectId('id'),
  validateQuery(getConversationQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const messageLimit = parseInt(req.query.limit as string) || 100;

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
  validateBody(updateTitleBodySchema),
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

// Get conversation stats
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
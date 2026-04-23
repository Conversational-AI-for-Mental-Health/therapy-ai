import { Router, Request, Response } from 'express';
import { authenticateUser, validateObjectId, extractValidationError } from '../middleware/validation';
import { validateBody } from '../middleware/schemaValidation';
import { JournalService } from '../services/journalService';
import { z } from 'zod';

// Validation schemas for journal entry creation and updates
const createEntryBodySchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text cannot exceed 10,000 characters'),
  mood: z.string().min(1, 'Mood is required').max(50, 'Mood cannot exceed 50 characters'),
  moodIcon: z.string().min(1, 'Mood icon is required').max(10, 'Mood icon cannot exceed 10 characters'),
});

const updateEntryBodySchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text cannot exceed 10,000 characters'),
});

const router = Router();

router.use(authenticateUser);

// Create new journal entry
router.post('/', validateBody(createEntryBodySchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { text, mood, moodIcon } = req.body;

        // Validate required fields
        const entry = await JournalService.createEntry(userId, text, mood, moodIcon);

        res.status(201).json({
            success: true,
            data: entry,
        });
    } catch (error: any) {
        const validationMsg = extractValidationError(error);
        if (validationMsg) {
            return res.status(400).json({ success: false, error: validationMsg });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create journal entry',
        });
    }
});

// Get all journal entries for the authenticated user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const entries = await JournalService.getEntriesForUser(userId);

        res.status(200).json({
            success: true,
            data: entries,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch journal entries',
        });
    }
});

// Update journal entry
router.patch('/:id', validateObjectId('id'), validateBody(updateEntryBodySchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const entryId = req.params.id;
        const { text } = req.body;

        if (text === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Text is required for update',
            });
        }

        //  Update the journal entry and ensure it belongs to the authenticated user
        const updatedEntry = await JournalService.updateEntry(entryId, userId, text);

        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                error: 'Journal entry not found or unauthorized',
            });
        }

        res.status(200).json({
            success: true,
            data: updatedEntry,
        });
    } catch (error: any) {
        const validationMsg = extractValidationError(error);
        if (validationMsg) {
            return res.status(400).json({ success: false, error: validationMsg });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update journal entry',
        });
    }
});

// Delete journal entry
router.delete('/:id', validateObjectId('id'), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const entryId = req.params.id;

        // Delete the journal entry and ensure it belongs to the authenticated user
        const success = await JournalService.deleteEntry(entryId, userId);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Journal entry not found or unauthorized',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Journal entry deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete journal entry',
        });
    }
});

export default router;
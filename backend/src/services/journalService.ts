import { Types } from 'mongoose';
import { JournalEntry, IJournalEntry } from '../models/JournalEntry';

// Service class for managing journal entries
export class JournalService {
    // Create a new journal entry for a user
    static async createEntry(
        userId: string | Types.ObjectId,
        text: string,
        mood: string,
        moodIcon: string
    ): Promise<IJournalEntry> {
        const entry = new JournalEntry({
            user_id: userId,
            text,
            mood,
            moodIcon
        });
        return entry.save();
    }

    // Get all journal entries for a specific user, sorted by creation date (newest first)
    static async getEntriesForUser(
        userId: string | Types.ObjectId
    ): Promise<IJournalEntry[]> {
        return JournalEntry.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    // Update the text of a journal entry, ensuring it belongs to the specified user
    static async updateEntry(
        entryId: string | Types.ObjectId,
        userId: string | Types.ObjectId,
        text: string
    ): Promise<IJournalEntry | null> {
        const entry = await JournalEntry.findOne({ _id: entryId, user_id: userId });
        if (!entry) return null;
        entry.text = text;
        return entry.save();
    }

    // Delete a journal entry, ensuring it belongs to the specified user
    static async deleteEntry(
        entryId: string | Types.ObjectId,
        userId: string | Types.ObjectId
    ): Promise<boolean> {
        const result = await JournalEntry.deleteOne({ _id: entryId, user_id: userId });
        return result.deletedCount === 1;
    }
}

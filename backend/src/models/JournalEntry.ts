import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the JournalEntry interface extending Mongoose Document
export interface IJournalEntry extends Document {
    user_id: Types.ObjectId;
    text: string;
    mood: string;
    moodIcon: string;
    createdAt: Date;
    updatedAt: Date;
}
// Define the JournalEntry schema
const JournalEntrySchema = new Schema<IJournalEntry>(
    {
        // Reference to the User model
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        text: {
            type: String,
            required: [true, 'Text is required'],
            maxlength: [10000, 'Text cannot exceed 10000 characters']
        },
        mood: {
            type: String,
            required: [true, 'Mood is required']
        },
        moodIcon: {
            type: String,
            required: [true, 'Mood icon is required']
        }
    },
    {
        timestamps: true
    }
);

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

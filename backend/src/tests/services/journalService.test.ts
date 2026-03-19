import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JournalService } from '../../services/journalService';
import { User } from '../../models';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;
// Set up an in-memory MongoDB instance before running tests, and clean up after all tests are done
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }

    const user = new User({
        email: 'test-journal@example.com',
        password_hash: '$2b$10$EP1oW4uIt/C8wXyK7B.k9elQYq1r/V7jP9E1oW4uIt/C8wXyK7B.k',
        name: 'Test Journal User',
    });
    await user.save();
    userId = user._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
// Unit tests for the JournalService class, covering creation, retrieval, updating, and deletion of journal entries while ensuring user ownership is respected
describe('JournalService', () => {
    // Test the creation of a new journal entry, verifying that the entry is saved with the correct user ID and content
    describe('createEntry', () => {
        it('should create a new journal entry successfully', async () => {
            const entry = await JournalService.createEntry(
                userId,
                'Had a great day today!',
                'Happy',
                '😊'
            );

            expect(entry).toBeDefined();
            expect(entry.user_id.toString()).toBe(userId.toString());
            expect(entry.text).toBe('Had a great day today!');
            expect(entry.mood).toBe('Happy');
            expect(entry.moodIcon).toBe('😊');
            expect(entry.createdAt).toBeDefined();
        });
    });
    // Test retrieval of journal entries for a user, ensuring that only entries belonging to the specified user are returned and that they are sorted by creation date in descending order
    describe('getEntriesForUser', () => {
        it('should retrieve entries only for the specified user, sorted by newest first', async () => {
            await JournalService.createEntry(userId, 'First entry', 'Calm', '😌');

            await new Promise(resolve => setTimeout(resolve, 10));

            const secondEntry = await JournalService.createEntry(userId, 'Second entry', 'Happy', '😊');


            const otherUserId = new mongoose.Types.ObjectId();
            await JournalService.createEntry(otherUserId, 'Other user entry', 'Sad', '😢');

            const entries = await JournalService.getEntriesForUser(userId);

            expect(entries).toHaveLength(2);
  
            expect(entries[0]._id.toString()).toBe(secondEntry._id.toString());
  
            expect(entries.map(e => e.text)).not.toContain('Other user entry');
        });
    });

    // Test updating a journal entry's text, ensuring that the update only occurs if the entry belongs to the specified user and that the updated text is saved correctly
    describe('updateEntry', () => {
        it('should update an entry text when ownership is matching', async () => {
            const entry = await JournalService.createEntry(
                userId,
                'Original text',
                'Sad',
                '😢'
            );

            const updated = await JournalService.updateEntry(
                entry._id,
                userId,
                'Updated text'
            );

            expect(updated).toBeDefined();
            expect(updated!.text).toBe('Updated text');
        });

        it('should return null if entry does not exist or user unauthenticated', async () => {
            const entry = await JournalService.createEntry(
                userId,
                'Original text',
                'Sad',
                '😢'
            );

            const otherUserId = new mongoose.Types.ObjectId();

            const updated = await JournalService.updateEntry(
                entry._id,
                otherUserId, 
                'Updated text'
            );

            expect(updated).toBeNull();
        });
    });

    // Test deletion of a journal entry, verifying that the entry is deleted only if it belongs to the specified user and that the function returns the correct success status based on ownership
    describe('deleteEntry', () => {
        it('should delete an entry when ownership is matching', async () => {
            const entry = await JournalService.createEntry(
                userId,
                'To be deleted',
                'Angry',
                '😡'
            );

            const success = await JournalService.deleteEntry(entry._id, userId);
            expect(success).toBe(true);

            const entries = await JournalService.getEntriesForUser(userId);
            expect(entries).toHaveLength(0);
        });

        it('should return false if entry does not exist or wrong user', async () => {
            const entry = await JournalService.createEntry(
                userId,
                'To be deleted',
                'Angry',
                '😡'
            );

            const otherUserId = new mongoose.Types.ObjectId();
            const success = await JournalService.deleteEntry(entry._id, otherUserId);

            expect(success).toBe(false);

            const entries = await JournalService.getEntriesForUser(userId);
            expect(entries).toHaveLength(1);
        });
    });
});

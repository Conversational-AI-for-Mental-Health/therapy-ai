import {model, Schema, Document} from 'mongoose';

export interface IMessage {
    role : 'user' | 'assistant';
    content : string;
    timestamp : Date;
}

export interface IConversation extends Document {
    socketId : string; // Using socket.id for now, could be a user ID
    messages : IMessage[];
    createdAt : Date;
    isArchived : boolean;
}

const MessageSchema = new Schema < IMessage > ({
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant']
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ConversationSchema = new Schema < IConversation > ({
    socketId: {
        type: String,
        required: true,
        index: true
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

export const Conversation = model < IConversation > ('Conversation', ConversationSchema);
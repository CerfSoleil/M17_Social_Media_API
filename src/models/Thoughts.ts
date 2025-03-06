import { Schema, model, Document, Types } from 'mongoose';
import { format } from 'date-fns';
import ReactionSchema from './schema/Reaction.js';

export interface IThought extends Document {
    thoughtText: string;
    createdAt: Date;
    username: string;
    reactions: Types.Array<Types.ObjectId>;
    reactionCount: number;
    userId: Types.ObjectId;
}

const ThoughtSchema = new Schema<IThought>({
    thoughtText: {
        type: String,
        required: true,
        min: 1,
        max: 280
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true
    },
    reactions: [ReactionSchema],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
    },
    toObject: {
        virtuals: true,
        versionKey: false,
    },
    id: false
});

ThoughtSchema.virtual('reactionCount').get(function (this: IThought) {
    return this.reactions.length;
});

ThoughtSchema.virtual('formattedCreatedAt').get(function (this: IThought) {
    return format(this.createdAt, 'HH:mm a MM-dd-yyyy');
});

const Thought = model<IThought>('thought', ThoughtSchema);

export default Thought;

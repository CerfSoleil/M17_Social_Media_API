import { Schema, model, SchemaTypes, Document, Types } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    thoughts: Types.ObjectId[];
    friends: Types.ObjectId[];
    friendCount: number;
}

const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[\s@]+$/;
    return emailPattern.test(email);
};

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        unique: true,
        required: true,
        trimmed: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [validateEmail, 'Please enter a valid email address'],
        match: [/^[^\s@]+@[^\s@]+\.[\s@]+$/, 'Please enter a valid email address'],
    },
    thoughts: [{
        type: SchemaTypes.ObjectId,
        ref: 'thought'
    }],
    friends: [{
        type: SchemaTypes.ObjectId,
        ref: 'user'
    }]
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

UserSchema.virtual('friendCount').get(function (this: IUser) {
    return this.friends?.length || 0;
});

const User = model<IUser>('user', UserSchema);

export default User;

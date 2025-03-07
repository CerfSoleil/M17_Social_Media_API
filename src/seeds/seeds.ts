import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import { User, Thought } from '../models/index.js';

dotenv.config();

const seedUsers = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        await User.deleteMany({});
        await Thought.deleteMany({});

        const usersData = [
            { username: 'Rebecca_Sugar', email: 'RbecS@email.com' },
            { username: 'testUser1', email: 'thisIsAnemail@email.com' },
            { username: 'john_doe', email: 'john.doe@gmail.com' },
            { username: 'jane_smith', email: 'jane.smith@gmail.com' },
            { username: 'Sanja_Rosa', email: 'SRosa@example.com' },
            { username: 'Moana', email: 'Moana@example.com' },
        ];

        const createdUsers = await User.insertMany(usersData);
//The problem currently resides here:
        const thoughtsData = [
            { thoughtText: 'Here comes a thought... That might alarm you.', username: createdUsers[0].username._id as Types.ObjectId },
            { thoughtText: 'This is another test thought', username: createdUsers[1].username },
            { thoughtText: 'This is a thought by John Doe', username: createdUsers[2].username },
            { thoughtText: 'This is a thought by Jane Smith', username: createdUsers[3].username },
            { thoughtText: 'Sanja pulls these thoughts', username: createdUsers[4].username._id },
            { thoughtText: 'Moana sails', username: createdUsers[5].username },
        ];

        const createdThoughts = await Thought.insertMany(thoughtsData);

        const reactionsData = [
            { reactionBody: 'Awesome!', username: createdUsers[1].username },
            { reactionBody: 'Interesting...', username: createdUsers[2].username },
            { reactionBody: 'I dig it.', username: createdUsers[3].username },
            { reactionBody: 'Cool!', username: createdUsers[0].username },
        ];

        const friendMappings = [
            [0, 1], [0, 2], [1, 0], [1, 3], [2, 3], [2, 4], [3, 2], [3, 5]
        ];

        for (const [userIdx, friendIdx] of friendMappings) {
            await User.findByIdAndUpdate(createdUsers[userIdx]._id, {
                $push: { friends: createdUsers[friendIdx]._id }
            });
        }

        for (let i = 0; i < createdUsers.length; i++) {
            await User.findByIdAndUpdate(createdUsers[i]._id, {
                $push: { thoughts: createdThoughts[i]?._id }
            });
        }

        for (let i = 0; i < reactionsData.length; i++) {
            await Thought.findByIdAndUpdate(createdThoughts[i]._id, {
                $push: { reactions: reactionsData[i] }
            });
        }

        console.log('🌱Database successfully seeded!');
    } catch (err) {
        console.error('❌Error seeding database:', err);
    } finally {
        await mongoose.disconnect();
    }
};

seedUsers();
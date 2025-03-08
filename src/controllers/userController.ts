import { Request, Response } from 'express';
import { format } from 'date-fns';
import { User, Thought } from '../models/index.js';
import { Types } from 'mongoose';

interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  thoughts: any[];
  friends: Types.ObjectId[];
  friendCount: number;
  toObject(options?: any): any;
}

type UserDocument = Document & IUser;

const formatUser = (user: UserDocument) => {
  const userObject = user.toObject({ virtuals: true });
  return {
    ...userObject,
    friendCount: userObject.friendCount,
    thoughts: userObject.thoughts.map((thought: any) => ({
      ...thought,
      createdAt: thought.createdAt ? format(thought.createdAt, "hh:mm a, MMM dd, yyyy") : null,
      reactions: thought.reactions && thought.reactions.length > 0 ? thought.reactions.map((reaction: any) => ({
        ...reaction,
        createdAt: reaction.createdAt ? format(reaction.createdAt, "hh:mm a, MMM dd, yyyy") : null,
      })) : [],
    }))
  };
};

export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('thoughts')
      .populate({ path: 'friends', select: '_id username email' });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(formatUser(user as unknown as UserDocument));
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};

export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.create({ username, email });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true });
    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Thought.deleteMany({ username: userToDelete.username });
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'User and associated thoughts deleted successfully' }); // Ensure the return type is Response
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const addFriend = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id);
    const friend = await User.findById(req.params.friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    if (user.friends.includes(new Types.ObjectId(req.params.friendId))) {
      return res.status(400).json({ message: 'Friend is already in friend list' });
    }

    await User.findByIdAndUpdate(req.params.id, { $push: { friends: new Types.ObjectId(req.params.friendId) } });
    return res.status(200).json({ message: 'Friend added successfully' });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const removeFriend = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id);
    const friend = await User.findById(req.params.friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    // Cast to ObjectId and check if the friend exists in the list
    if (!user.friends.includes(new Types.ObjectId(req.params.friendId))) {
      return res.status(400).json({ message: 'Friend is not in friend list' });
    }

    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: new Types.ObjectId(req.params.friendId) } });
    return res.status(200).json({ message: 'Friend removed successfully' });
  } catch (err) {
    return res.status(400).json(err);
  }
};
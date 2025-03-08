import { Request, Response } from 'express';
import { format } from 'date-fns';
import Thought from '../models/Thoughts.js';
import User from '../models/User.js';
import { IThought } from '../models/Thoughts.js';
import { IReaction } from '../models/schema/Reaction.js';

const formatThought = (thought: IThought) => {
    const thoughtObject = thought.toObject();
    return {
        ...thoughtObject,
        createdAt: format(thought.createdAt, "hh:mm a, MM/dd/yyyy"),
        reactions: thoughtObject.reactions.map((reaction: IReaction) => ({
            ...reaction,
            createdAt: format(reaction.createdAt, "hh:mm a, MM/dd/yyyy"),
        })),
    };
};

export const getThoughts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const thoughts = await Thought.find();
        res.status(200).json(thoughts.map(formatThought));
    } catch (err) {
        res.status(400).json(err);
    }
};

export const getThoughtById = async (req: Request, res: Response): Promise<void> => {
    try {
        const thought = await Thought.findById(req.params.id);
        if (!thought) {
            res.status(404).json({ message: 'Thought not found' });
            return;
        }
        res.status(200).json(formatThought(thought));
    } catch (err) {
        res.status(400).json(err);
    }
};

export const createThought = async (req: Request, res: Response): Promise<void> => {
    try {
        const { thoughtText, username, userId } = req.body;
        if (!thoughtText || !username || !userId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const thought = await Thought.create({ thoughtText, username, userId });
        await User.findByIdAndUpdate(userId, { $push: { thoughts: thought._id } });
        res.status(201).json(formatThought(thought));
    } catch (err) {
        res.status(400).json(err);
    }
};

export const updateThought = async (req: Request, res: Response): Promise<void> => {
    try {
        const { thoughtText } = req.body;
        if (!thoughtText) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const updatedThought = await Thought.findByIdAndUpdate(req.params.id, { thoughtText }, { new: true });
        res.status(200).json(updatedThought ? formatThought(updatedThought) : { message: 'Thought not found' });
    } catch (err) {
        res.status(400).json(err);
    }
};

export const deleteThought = async (req: Request, res: Response): Promise<void> => {
    try {
        const thoughtToDelete = await Thought.findById(req.params.id);
        if (!thoughtToDelete) {
            res.status(404).json({ message: 'Thought not found' });
            return;
        }
        await User.findByIdAndUpdate(thoughtToDelete.userId, { $pull: { thoughts: thoughtToDelete._id } });
        await Thought.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Thought deleted' });
    } catch (err) {
        res.status(400).json(err);
    }
};

export const addReaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reactionBody, username } = req.body;
        if (!reactionBody || !username) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const updatedThought = await Thought.findByIdAndUpdate(req.params.id, { $push: { reactions: { reactionBody, username } } }, { new: true });
        res.status(200).json(updatedThought ? formatThought(updatedThought) : { message: 'Thought not found' });
    } catch (err) {
        res.status(400).json(err);
    }
};

export const deleteReaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedThought = await Thought.findByIdAndUpdate(req.params.id, { $pull: { reactions: { _id: req.params.reactionId } } }, { new: true });
        res.status(200).json(updatedThought ? formatThought(updatedThought) : { message: 'Thought not found' });
    } catch (err) {
        res.status(400).json(err);
    }
};
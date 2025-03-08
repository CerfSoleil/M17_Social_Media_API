import { Router } from 'express';
const router = Router();

import {
  getThoughts,
  getThoughtById,
  createThought,
  updateThought,
  deleteThought,
  addReaction,
  deleteReaction
} from '../../controllers/thoughtController.js';

// /api/thoughts
router.route('/')
  .get(getThoughts)
  .post(createThought);

// /api/thoughts/:id
router.route('/:id')
  .get(getThoughtById)
  .put(updateThought)
  .delete(deleteThought);

// /api/thoughts/:id/reactions
router.route('/:id/reactions')
  .post(addReaction);

// /api/thoughts/:id/reactions/:reactionId
router.route('/:id/reactions/:reactionId')
  .delete(deleteReaction);

export default router;

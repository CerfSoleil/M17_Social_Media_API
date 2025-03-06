import { Router } from 'express';
const router = Router();
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    addFriend,
    removeFriend
} from '../../controllers/userController.js'

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.route('/api/users/:id/friends/:friendId')
    .post(addFriend)
    .delete(removeFriend);

export default router;
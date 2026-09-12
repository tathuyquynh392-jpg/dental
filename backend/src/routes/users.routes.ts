import { Router } from 'express';
import { getUsers, getUserById, createUser, toggleUserStatus, resetUserPassword, deleteUser } from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/reset-password', resetUserPassword);
router.delete('/:id', deleteUser);

export default router;

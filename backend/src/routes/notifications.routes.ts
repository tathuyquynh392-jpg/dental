import { Router } from 'express';
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notifications.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/', requireAdmin, createNotification);
router.delete('/:id', requireAdmin, deleteNotification);

export default router;

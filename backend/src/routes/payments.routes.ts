import { Router } from 'express';
import { getPayments, getPaymentById, createPayment, deletePayment } from '../controllers/payments.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', requireAdmin, createPayment);
router.delete('/:id', requireAdmin, deletePayment);

export default router;

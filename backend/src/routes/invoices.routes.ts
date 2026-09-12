import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoices.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', requireAdmin, createInvoice);
router.put('/:id', requireAdmin, updateInvoice);
router.delete('/:id', requireAdmin, deleteInvoice);

export default router;

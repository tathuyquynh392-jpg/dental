import { Router } from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/services.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getServices);
router.get('/:id', getServiceById);

router.post('/', authenticate, requireAdmin, createService);
router.put('/:id', authenticate, requireAdmin, updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

export default router;

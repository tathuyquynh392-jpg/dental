import { Router } from 'express';
import { getTreatments, getTreatmentById, createTreatment, updateTreatment, deleteTreatment } from '../controllers/treatments.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTreatments);
router.get('/:id', getTreatmentById);
router.post('/', requireAdmin, createTreatment);
router.put('/:id', requireAdmin, updateTreatment);
router.delete('/:id', requireAdmin, deleteTreatment);

export default router;

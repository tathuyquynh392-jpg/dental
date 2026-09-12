import { Router } from 'express';
import { getMedications, getMedicationById, createMedication, updateMedication, deleteMedication } from '../controllers/medications.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMedications);
router.get('/:id', getMedicationById);
router.post('/', requireAdmin, createMedication);
router.put('/:id', requireAdmin, updateMedication);
router.delete('/:id', requireAdmin, deleteMedication);

export default router;

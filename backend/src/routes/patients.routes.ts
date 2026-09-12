import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patients.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', requireAdmin, createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', requireAdmin, deletePatient);

export default router;

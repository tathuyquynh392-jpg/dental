import { Router } from 'express';
import { getMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../controllers/medicalRecords.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.post('/', requireAdmin, createMedicalRecord);
router.put('/:id', requireAdmin, updateMedicalRecord);
router.delete('/:id', requireAdmin, deleteMedicalRecord);

export default router;

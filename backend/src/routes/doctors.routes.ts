import { Router } from 'express';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } from '../controllers/doctors.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public / Patient read access, Admin write access
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

router.post('/', authenticate, requireAdmin, createDoctor);
router.put('/:id', authenticate, requireAdmin, updateDoctor);
router.delete('/:id', authenticate, requireAdmin, deleteDoctor);

export default router;

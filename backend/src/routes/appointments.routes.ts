import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointments.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', requireAdmin, deleteAppointment);

export default router;

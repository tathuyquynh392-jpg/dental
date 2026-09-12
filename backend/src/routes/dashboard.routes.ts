import { Router } from 'express';
import { getAdminDashboardStats, getPatientDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/admin', requireAdmin, getAdminDashboardStats);
router.get('/patient', getPatientDashboardStats);

export default router;

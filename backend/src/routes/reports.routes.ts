import { Router } from 'express';
import { getReportsData } from '../controllers/reports.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getReportsData);

export default router;

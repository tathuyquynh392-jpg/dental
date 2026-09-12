import { Router } from 'express';
import authRoutes from './auth.routes';
import patientsRoutes from './patients.routes';
import doctorsRoutes from './doctors.routes';
import servicesRoutes from './services.routes';
import appointmentsRoutes from './appointments.routes';
import medicalRecordsRoutes from './medicalRecords.routes';
import treatmentsRoutes from './treatments.routes';
import medicationsRoutes from './medications.routes';
import invoicesRoutes from './invoices.routes';
import paymentsRoutes from './payments.routes';
import usersRoutes from './users.routes';
import notificationsRoutes from './notifications.routes';
import dashboardRoutes from './dashboard.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientsRoutes);
router.use('/doctors', doctorsRoutes);
router.use('/services', servicesRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/medical-records', medicalRecordsRoutes);
router.use('/treatments', treatmentsRoutes);
router.use('/medications', medicationsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);

export default router;

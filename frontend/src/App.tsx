import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PatientLayout } from './layouts/PatientLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PatientList } from './pages/admin/PatientList';
import { PatientDetail } from './pages/admin/PatientDetail';
import { DoctorList } from './pages/admin/DoctorList';
import { ServiceList } from './pages/admin/ServiceList';
import { AppointmentList } from './pages/admin/AppointmentList';
import { CalendarPage } from './pages/admin/CalendarPage';
import { MedicalRecordList } from './pages/admin/MedicalRecordList';
import { TreatmentList } from './pages/admin/TreatmentList';
import { MedicationList } from './pages/admin/MedicationList';
import { InvoiceList } from './pages/admin/InvoiceList';
import { PaymentList } from './pages/admin/PaymentList';
import { UserList } from './pages/admin/UserList';
import { NotificationList } from './pages/admin/NotificationList';
import { ReportPage } from './pages/admin/ReportPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { CreateAppointment } from './pages/patient/CreateAppointment';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { PatientMedicalRecords } from './pages/patient/PatientMedicalRecords';
import { PatientTreatments } from './pages/patient/PatientTreatments';
import { PatientInvoices } from './pages/patient/PatientInvoices';
import { PatientNotifications } from './pages/patient/PatientNotifications';
import { PatientSettings } from './pages/patient/PatientSettings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="doctors" element={<DoctorList />} />
              <Route path="services" element={<ServiceList />} />
              <Route path="appointments" element={<AppointmentList />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="medical-records" element={<MedicalRecordList />} />
              <Route path="treatments" element={<TreatmentList />} />
              <Route path="medications" element={<MedicationList />} />
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="payments" element={<PaymentList />} />
              <Route path="users" element={<UserList />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="reports" element={<ReportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Patient Portal Routes */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="appointments/create" element={<CreateAppointment />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="medical-records" element={<PatientMedicalRecords />} />
              <Route path="treatments" element={<PatientTreatments />} />
              <Route path="invoices" element={<PatientInvoices />} />
              <Route path="notifications" element={<PatientNotifications />} />
              <Route path="settings" element={<PatientSettings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'PATIENT';
  status: 'ACTIVE' | 'LOCKED';
  createdAt?: string;
  patientId?: number;
  patient?: Patient;
}

export interface Patient {
  id: number;
  userId: number;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory?: string;
  allergy?: string;
  notes?: string;
  createdAt?: string;
  user?: User;
  appointments?: Appointment[];
  medicalRecords?: MedicalRecord[];
  treatments?: Treatment[];
  invoices?: Invoice[];
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  qualification: string;
  experience: string;
  workingDays: string;
  workingHours: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  symptoms: string;
  diagnosis: string;
  dentalCondition: string;
  treatment: string;
  notes?: string;
  prescription?: string;
  followUpDate?: string;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
  createdAt?: string;
}

export interface Treatment {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  startDate: string;
  endDate?: string;
  cost: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface Medication {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price: number;
  expiryDate: string;
  supplier: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  serviceId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  service?: Service;
}

export interface Invoice {
  id: number;
  invoiceCode: string;
  patientId: number;
  appointmentId?: number;
  invoiceDate: string;
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  patient?: Patient;
  appointment?: Appointment;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface Payment {
  id: number;
  paymentCode: string;
  invoiceId: number;
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
  paymentDate: string;
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
  note?: string;
  invoice?: Invoice;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  warnings?: {
    lowStock: number;
    outOfStock: number;
    nearExpiry: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

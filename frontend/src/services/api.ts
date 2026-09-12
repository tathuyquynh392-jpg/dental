import axios from 'axios';
import { Patient, Doctor, Service, Appointment, MedicalRecord, Treatment, Medication, Invoice, Payment, User, Notification } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-Memory Singleton Store for Interactive Demo Mode
let demoStore: any = null;

const createSeedStore = () => {
  const initialPatients: Patient[] = [
    {
      id: 1,
      userId: 101,
      dateOfBirth: '1992-05-14',
      gender: 'Nam',
      address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
      medicalHistory: 'Sức khỏe bình thường, không có bệnh lý nền',
      allergy: 'Dị ứng nhẹ với Penicillin',
      notes: 'Bệnh nhân tái khám định kỳ 6 tháng/lần',
      createdAt: '2026-01-10T08:00:00.000Z',
      user: { id: 101, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0988123456', role: 'PATIENT', status: 'ACTIVE' }
    },
    {
      id: 2,
      userId: 102,
      dateOfBirth: '1995-11-20',
      gender: 'Nữ',
      address: '456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM',
      medicalHistory: 'Tiền sử sâu răng nhẹ',
      allergy: 'Không có',
      notes: 'Quan tâm dịch vụ niềng răng thẩm mỹ',
      createdAt: '2026-02-15T09:30:00.000Z',
      user: { id: 102, name: 'Trần Thị Mai', email: 'mai.tran@gmail.com', phone: '0912345678', role: 'PATIENT', status: 'ACTIVE' }
    },
    {
      id: 3,
      userId: 103,
      dateOfBirth: '1988-03-08',
      gender: 'Nam',
      address: '789 CMT8, Phường 10, Quận 10, TP.HCM',
      medicalHistory: 'Cao huyết áp nhẹ',
      allergy: 'Không có',
      notes: 'Đã cấy ghép Implant thành công năm 2025',
      createdAt: '2026-03-01T14:15:00.000Z',
      user: { id: 103, name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0938999888', role: 'PATIENT', status: 'ACTIVE' }
    },
    {
      id: 4,
      userId: 104,
      dateOfBirth: '1998-07-25',
      gender: 'Nữ',
      address: '12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
      medicalHistory: 'Răng nhạy cảm khi dùng đồ lạnh',
      allergy: 'Không có',
      notes: 'Cần tẩy trắng răng laser chuẩn bị cưới',
      createdAt: '2026-04-10T11:00:00.000Z',
      user: { id: 104, name: 'Phạm Ngọc Ánh', email: 'anh.pham@gmail.com', phone: '0977112233', role: 'PATIENT', status: 'ACTIVE' }
    },
  ];

  const initialDoctors: Doctor[] = [
    {
      id: 1,
      name: 'BS. CKII Nguyễn Minh Tâm',
      email: 'minhtam@luckydental.com',
      phone: '0903112233',
      specialty: 'Chỉnh Nha & Cấy Ghép Implant',
      qualification: 'Tiến sĩ Nha khoa - Đại học Y Dược TP.HCM',
      experience: '15 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Thứ 7',
      workingHours: '08:00 - 17:00',
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'BS. CKI Trần Hương Giang',
      email: 'huonggiang@luckydental.com',
      phone: '0908445566',
      specialty: 'Nha Khoa Thẩm Mỹ & Phục Hình',
      qualification: 'Thạc sĩ Nha khoa Thẩm mỹ',
      experience: '10 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Chủ Nhật',
      workingHours: '08:30 - 18:00',
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'BS. Võ Văn Hoàng',
      email: 'vanhoang@luckydental.com',
      phone: '0909778899',
      specialty: 'Điều Trị Nội Nha & Phẫu Thuật Răng',
      qualification: 'Bác sĩ Răng Hàm Mặt',
      experience: '8 năm kinh nghiệm',
      workingDays: 'Thứ 3 - Thứ 7',
      workingHours: '09:00 - 17:30',
      status: 'ACTIVE'
    }
  ];

  const initialServices: Service[] = [
    { id: 1, name: 'Khám & Tư Vấn Tổng Quát', description: 'Kiểm tra tình trạng răng miệng toàn diện và tư vấn lộ trình', price: 150000, duration: 30, status: 'ACTIVE' },
    { id: 2, name: 'Cạo Vôi & Đánh Bóng Răng', description: 'Làm sạch cao răng sóng siêu âm mịn sáng', price: 350000, duration: 45, status: 'ACTIVE' },
    { id: 3, name: 'Tẩy Trắng Răng Laser Whitening', description: 'Công nghệ Laser bật tông trắng sáng an toàn', price: 1800000, duration: 60, status: 'ACTIVE' },
    { id: 4, name: 'Trám Răng Composite Thẩm Mỹ', description: 'Trám răng tự nhiên bền chắc trùng màu răng', price: 400000, duration: 45, status: 'ACTIVE' },
    { id: 5, name: 'Niềng Răng Mắc Cài Kim Loại', description: 'Chỉnh nha nắn đều răng móm lệch chuẩn y khoa', price: 28000000, duration: 90, status: 'ACTIVE' },
    { id: 6, name: 'Cấy Ghép Implant Hàn Quốc', description: 'Thay thế chân răng đã mất bền đẹp trọn đời', price: 15000000, duration: 90, status: 'ACTIVE' },
  ];

  const initialAppointments: Appointment[] = [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      serviceId: 1,
      appointmentDate: '2026-09-15',
      appointmentTime: '09:00',
      notes: 'Khám tư vấn niềng răng',
      status: 'CONFIRMED',
      patient: initialPatients[0],
      doctor: initialDoctors[0],
      service: initialServices[0]
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 2,
      serviceId: 3,
      appointmentDate: '2026-09-16',
      appointmentTime: '14:30',
      notes: 'Tẩy trắng răng trước ngày cưới',
      status: 'PENDING',
      patient: initialPatients[1],
      doctor: initialDoctors[1],
      service: initialServices[2]
    },
    {
      id: 3,
      patientId: 3,
      doctorId: 3,
      serviceId: 4,
      appointmentDate: '2026-09-18',
      appointmentTime: '10:00',
      notes: 'Trám răng hàm số 6',
      status: 'COMPLETED',
      patient: initialPatients[2],
      doctor: initialDoctors[2],
      service: initialServices[3]
    }
  ];

  const initialMedicalRecords: MedicalRecord[] = [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      symptoms: 'Răng chen chúc nhẹ hàm dưới',
      diagnosis: 'Sai lệch khớp cấm độ 1',
      dentalCondition: 'Khớp cấm lệch nhẹ, men răng khỏe',
      treatment: 'Lên kế hoạch niềng răng mắc cài',
      prescription: 'Nước súc miệng Chlorohexidine, Bàn chải kẽ',
      followUpDate: '2026-10-01',
      createdAt: '2026-09-10T10:00:00.000Z',
      patient: initialPatients[0],
      doctor: initialDoctors[0]
    }
  ];

  const initialTreatments: Treatment[] = [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      serviceId: 5,
      startDate: '2026-08-01',
      endDate: '2027-08-01',
      cost: 28000000,
      status: 'IN_PROGRESS',
      notes: 'Giai đoạn gắn mắc cài 2 hàm',
      patient: initialPatients[0],
      doctor: initialDoctors[0],
      service: initialServices[4]
    }
  ];

  const initialMedications: Medication[] = [
    { id: 1, name: 'Amoxicillin 500mg', category: 'Kháng sinh', unit: 'Hộp', quantity: 150, price: 95000, expiryDate: '2027-12-31', supplier: 'Dược Hậu Giang', status: 'AVAILABLE' },
    { id: 2, name: 'Paracetamol 500mg', category: 'Giảm đau', unit: 'Hộp', quantity: 200, price: 45000, expiryDate: '2027-10-15', supplier: 'Pharmedic', status: 'AVAILABLE' },
    { id: 3, name: 'Nước Súc Miệng Kin Gingival', category: 'Vệ sinh', unit: 'Chai', quantity: 15, price: 135000, expiryDate: '2026-11-20', supplier: 'Kin Spain', status: 'LOW_STOCK' },
  ];

  const initialInvoices: Invoice[] = [
    {
      id: 1,
      invoiceCode: 'HD-20260901',
      patientId: 1,
      invoiceDate: '2026-09-10',
      subtotal: 1800000,
      discount: 200000,
      total: 1600000,
      paidAmount: 1600000,
      status: 'PAID',
      patient: initialPatients[0],
      items: [
        { id: 1, description: 'Cạo Vôi & Tẩy Trắng Răng Laser', quantity: 1, unitPrice: 1800000, amount: 1800000 }
      ]
    }
  ];

  const initialPayments: Payment[] = [
    {
      id: 1,
      paymentCode: 'TT-20260901',
      invoiceId: 1,
      amount: 1600000,
      paymentMethod: 'TRANSFER',
      paymentDate: '2026-09-10T10:30:00.000Z',
      status: 'COMPLETED',
      note: 'Chuyển khoản VietQR qua ngân hàng MBBank',
      invoice: initialInvoices[0]
    }
  ];

  const initialUsers: User[] = [
    { id: 1, name: 'Quản Trị Viên (Admin)', email: 'admin@luckydental.com', phone: '0988123456', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 101, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0988123456', role: 'PATIENT', status: 'ACTIVE', createdAt: '2026-01-10T08:00:00.000Z' },
    { id: 102, name: 'Trần Thị Mai', email: 'mai.tran@gmail.com', phone: '0912345678', role: 'PATIENT', status: 'ACTIVE', createdAt: '2026-02-15T09:30:00.000Z' },
  ];

  const initialNotifications: Notification[] = [
    { id: 1, userId: 1, title: 'Lịch hẹn mới', message: 'Bệnh nhân Nguyễn Văn An vừa đặt lịch hẹn khám vào 09:00 15/09/2026', isRead: false, createdAt: '2026-09-12T08:00:00.000Z' },
    { id: 2, userId: 101, title: 'Nhắc nhở lịch hẹn', message: 'Bạn có lịch hẹn tái khám niềng răng vào 09:00 15/09/2026', isRead: false, createdAt: '2026-09-12T08:30:00.000Z' }
  ];

  return {
    patients: initialPatients,
    doctors: initialDoctors,
    services: initialServices,
    appointments: initialAppointments,
    medicalRecords: initialMedicalRecords,
    treatments: initialTreatments,
    medications: initialMedications,
    invoices: initialInvoices,
    payments: initialPayments,
    users: initialUsers,
    notifications: initialNotifications
  };
};

const getStore = () => {
  if (!demoStore) {
    const saved = localStorage.getItem('luckydental_demo_db');
    if (saved) {
      try { demoStore = JSON.parse(saved); } catch (e) {}
    }
  }
  if (!demoStore) {
    demoStore = createSeedStore();
    localStorage.setItem('luckydental_demo_db', JSON.stringify(demoStore));
  }
  return demoStore;
};

const saveStore = (store: any) => {
  demoStore = store;
  localStorage.setItem('luckydental_demo_db', JSON.stringify(store));
};

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Interactive Demo Engine for GitHub Pages Online Static Host
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '#/login';
      }
      return Promise.reject(error);
    }

    // Network / Static 404 Fallback - Full Interactive CRUD Engine
    if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();
      let reqBody: any = {};
      try {
        if (typeof error.config?.data === 'string') {
          reqBody = JSON.parse(error.config.data);
        } else if (error.config?.data) {
          reqBody = error.config.data;
        }
      } catch (e) {
        reqBody = {};
      }

      const store = getStore();
      const params = error.config?.params || {};

      console.log(`[Demo Engine] ${method.toUpperCase()} ${url}`, reqBody, params);

      // --- AUTH ---
      if (url.includes('/auth/login')) {
        const isAdmin = reqBody.email?.toLowerCase().includes('admin');
        const user = {
          id: isAdmin ? 1 : 101,
          name: isAdmin ? 'Quản Trị Viên (Admin)' : 'Nguyễn Văn An',
          fullName: isAdmin ? 'Quản Trị Viên (Admin)' : 'Nguyễn Văn An',
          email: reqBody.email || (isAdmin ? 'admin@luckydental.com' : 'patient@luckydental.com'),
          phone: '0988123456',
          role: isAdmin ? 'ADMIN' : 'PATIENT',
          status: 'ACTIVE',
        };
        return Promise.resolve({
          data: {
            success: true,
            message: 'Đăng nhập thành công',
            token: 'demo-jwt-token',
            data: { user, token: 'demo-jwt-token' }
          }
        });
      }

      if (url.includes('/auth/me')) {
        const saved = sessionStorage.getItem('user') || localStorage.getItem('user');
        const user = saved ? JSON.parse(saved) : store.users[0];
        return Promise.resolve({ data: { success: true, data: user } });
      }

      if (url.includes('/auth/register')) {
        const newUser = {
          id: Date.now(),
          name: reqBody.name || 'Bệnh Nhân Mới',
          email: reqBody.email,
          phone: reqBody.phone || '0901234567',
          role: 'PATIENT' as const,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString()
        };
        store.users.unshift(newUser);
        const newPatient: Patient = {
          id: store.patients.length + 1,
          userId: newUser.id,
          dateOfBirth: reqBody.dateOfBirth || '1998-01-01',
          gender: reqBody.gender || 'Nam',
          address: reqBody.address || 'TP.HCM',
          medicalHistory: '',
          allergy: '',
          notes: '',
          createdAt: new Date().toISOString(),
          user: newUser
        };
        store.patients.unshift(newPatient);
        saveStore(store);
        return Promise.resolve({ data: { success: true, data: { user: newUser, token: 'demo-jwt-token' } } });
      }

      // --- PATIENTS ---
      if (url.includes('/patients')) {
        if (method === 'get') {
          const idMatch = url.match(/\/patients\/(\d+)/);
          if (idMatch) {
            const pid = parseInt(idMatch[1]);
            const p = store.patients.find((item: any) => item.id === pid) || store.patients[0];
            return Promise.resolve({ data: { success: true, data: p } });
          }
          let list = [...store.patients];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((p: any) =>
              p.user?.name?.toLowerCase().includes(q) ||
              p.user?.email?.toLowerCase().includes(q) ||
              p.user?.phone?.includes(q) ||
              p.address?.toLowerCase().includes(q)
            );
          }
          if (params.gender && params.gender !== 'ALL') {
            list = list.filter((p: any) => p.gender === params.gender);
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((p: any) => p.user?.status === params.status);
          }
          return Promise.resolve({
            data: {
              success: true,
              data: list,
              meta: { total: list.length, page: 1, limit: 10, totalPages: 1 }
            }
          });
        }
        if (method === 'post') {
          const newId = Date.now();
          const newPatient: Patient = {
            id: newId,
            userId: newId + 100,
            dateOfBirth: reqBody.dateOfBirth || '1995-01-01',
            gender: reqBody.gender || 'Nam',
            address: reqBody.address || 'TP.HCM',
            medicalHistory: reqBody.medicalHistory || '',
            allergy: reqBody.allergy || '',
            notes: reqBody.notes || '',
            createdAt: new Date().toISOString(),
            user: {
              id: newId + 100,
              name: reqBody.name || 'Bệnh Nhân Mới',
              email: reqBody.email || `patient${newId}@gmail.com`,
              phone: reqBody.phone || '0900000000',
              role: 'PATIENT' as const,
              status: 'ACTIVE' as const
            }
          };
          store.patients.unshift(newPatient);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Thêm bệnh nhân thành công', data: newPatient } });
        }
        if (method === 'put') {
          const idMatch = url.match(/\/patients\/(\d+)/);
          if (idMatch) {
            const pid = parseInt(idMatch[1]);
            const idx = store.patients.findIndex((item: any) => item.id === pid);
            if (idx !== -1) {
              store.patients[idx] = {
                ...store.patients[idx],
                dateOfBirth: reqBody.dateOfBirth || store.patients[idx].dateOfBirth,
                gender: reqBody.gender || store.patients[idx].gender,
                address: reqBody.address || store.patients[idx].address,
                medicalHistory: reqBody.medicalHistory || store.patients[idx].medicalHistory,
                allergy: reqBody.allergy || store.patients[idx].allergy,
                user: {
                  ...store.patients[idx].user,
                  name: reqBody.name || store.patients[idx].user?.name,
                  phone: reqBody.phone || store.patients[idx].user?.phone,
                }
              };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật thành công', data: store.patients[idx] } });
            }
          }
        }
        if (method === 'delete') {
          const idMatch = url.match(/\/patients\/(\d+)/);
          if (idMatch) {
            const pid = parseInt(idMatch[1]);
            store.patients = store.patients.filter((item: any) => item.id !== pid);
            saveStore(store);
            return Promise.resolve({ data: { success: true, message: 'Xóa bệnh nhân thành công' } });
          }
        }
      }

      // --- DOCTORS ---
      if (url.includes('/doctors')) {
        if (method === 'get') {
          let list = [...store.doctors];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((d: any) =>
              d.name?.toLowerCase().includes(q) ||
              d.email?.toLowerCase().includes(q) ||
              d.phone?.includes(q) ||
              d.specialty?.toLowerCase().includes(q)
            );
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((d: any) => d.status === params.status);
          }
          return Promise.resolve({
            data: {
              success: true,
              data: list,
              meta: { total: list.length, page: 1, limit: 10, totalPages: 1 }
            }
          });
        }
        if (method === 'post') {
          const newDoc: Doctor = {
            id: Date.now(),
            name: reqBody.name || 'BS. Nguyễn Văn Mới',
            email: reqBody.email || 'bacsi@luckydental.com',
            phone: reqBody.phone || '0901112222',
            specialty: reqBody.specialty || 'Nha Khoa Tổng Quát',
            qualification: reqBody.qualification || 'Bác sĩ Chuyên Khoa',
            experience: reqBody.experience || '5 năm kinh nghiệm',
            workingDays: reqBody.workingDays || 'Thứ 2 - Thứ 6',
            workingHours: reqBody.workingHours || '08:00 - 17:00',
            status: (reqBody.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE'
          };
          store.doctors.unshift(newDoc);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Thêm bác sĩ thành công', data: newDoc } });
        }
        if (method === 'put') {
          const idMatch = url.match(/\/doctors\/(\d+)/);
          if (idMatch) {
            const did = parseInt(idMatch[1]);
            const idx = store.doctors.findIndex((item: any) => item.id === did);
            if (idx !== -1) {
              store.doctors[idx] = { ...store.doctors[idx], ...reqBody };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật bác sĩ thành công', data: store.doctors[idx] } });
            }
          }
        }
        if (method === 'delete') {
          const idMatch = url.match(/\/doctors\/(\d+)/);
          if (idMatch) {
            const did = parseInt(idMatch[1]);
            store.doctors = store.doctors.filter((item: any) => item.id !== did);
            saveStore(store);
            return Promise.resolve({ data: { success: true, message: 'Xóa bác sĩ thành công' } });
          }
        }
      }

      // --- SERVICES ---
      if (url.includes('/services')) {
        if (method === 'get') {
          let list = [...store.services];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((s: any) =>
              s.name?.toLowerCase().includes(q) ||
              s.description?.toLowerCase().includes(q)
            );
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((s: any) => s.status === params.status);
          }
          return Promise.resolve({
            data: {
              success: true,
              data: list,
              meta: { total: list.length, page: 1, limit: 10, totalPages: 1 }
            }
          });
        }
        if (method === 'post') {
          const newService: Service = {
            id: Date.now(),
            name: reqBody.name || 'Dịch Vụ Mới',
            description: reqBody.description || 'Mô tả dịch vụ',
            price: Number(reqBody.price) || 200000,
            duration: Number(reqBody.duration) || 30,
            status: (reqBody.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE'
          };
          store.services.unshift(newService);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Thêm dịch vụ thành công', data: newService } });
        }
        if (method === 'put') {
          const idMatch = url.match(/\/services\/(\d+)/);
          if (idMatch) {
            const sid = parseInt(idMatch[1]);
            const idx = store.services.findIndex((item: any) => item.id === sid);
            if (idx !== -1) {
              store.services[idx] = { ...store.services[idx], ...reqBody };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật dịch vụ thành công', data: store.services[idx] } });
            }
          }
        }
        if (method === 'delete') {
          const idMatch = url.match(/\/services\/(\d+)/);
          if (idMatch) {
            const sid = parseInt(idMatch[1]);
            store.services = store.services.filter((item: any) => item.id !== sid);
            saveStore(store);
            return Promise.resolve({ data: { success: true, message: 'Xóa dịch vụ thành công' } });
          }
        }
      }

      // --- APPOINTMENTS ---
      if (url.includes('/appointments')) {
        if (method === 'get') {
          let list = [...store.appointments];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((a: any) =>
              a.patient?.user?.name?.toLowerCase().includes(q) ||
              a.doctor?.name?.toLowerCase().includes(q) ||
              a.service?.name?.toLowerCase().includes(q)
            );
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((a: any) => a.status === params.status);
          }
          return Promise.resolve({
            data: {
              success: true,
              data: list,
              meta: { total: list.length, page: 1, limit: 10, totalPages: 1 }
            }
          });
        }
        if (method === 'post') {
          const patientObj = store.patients.find((p: any) => p.id === Number(reqBody.patientId)) || store.patients[0];
          const doctorObj = store.doctors.find((d: any) => d.id === Number(reqBody.doctorId)) || store.doctors[0];
          const serviceObj = store.services.find((s: any) => s.id === Number(reqBody.serviceId)) || store.services[0];

          const newApp: Appointment = {
            id: Date.now(),
            patientId: Number(reqBody.patientId) || 1,
            doctorId: Number(reqBody.doctorId) || 1,
            serviceId: Number(reqBody.serviceId) || 1,
            appointmentDate: reqBody.appointmentDate || '2026-09-20',
            appointmentTime: reqBody.appointmentTime || '10:00',
            notes: reqBody.notes || 'Đặt lịch qua website',
            status: 'PENDING',
            patient: patientObj,
            doctor: doctorObj,
            service: serviceObj
          };
          store.appointments.unshift(newApp);
          store.notifications.unshift({
            id: Date.now(),
            userId: 1,
            title: 'Lịch hẹn mới',
            message: `Lịch hẹn mới từ ${patientObj.user?.name} lúc ${newApp.appointmentTime} ${newApp.appointmentDate}`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Đặt lịch hẹn thành công', data: newApp } });
        }
        if (method === 'put' || method === 'patch') {
          const idMatch = url.match(/\/appointments\/(\d+)/);
          if (idMatch) {
            const aid = parseInt(idMatch[1]);
            const idx = store.appointments.findIndex((item: any) => item.id === aid);
            if (idx !== -1) {
              store.appointments[idx] = { ...store.appointments[idx], ...reqBody };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật lịch hẹn thành công', data: store.appointments[idx] } });
            }
          }
        }
        if (method === 'delete') {
          const idMatch = url.match(/\/appointments\/(\d+)/);
          if (idMatch) {
            const aid = parseInt(idMatch[1]);
            store.appointments = store.appointments.filter((item: any) => item.id !== aid);
            saveStore(store);
            return Promise.resolve({ data: { success: true, message: 'Hủy lịch hẹn thành công' } });
          }
        }
      }

      // --- MEDICAL RECORDS ---
      if (url.includes('/medical-records')) {
        if (method === 'get') {
          return Promise.resolve({ data: { success: true, data: store.medicalRecords } });
        }
        if (method === 'post') {
          const newRecord: MedicalRecord = {
            id: Date.now(),
            patientId: Number(reqBody.patientId) || 1,
            doctorId: Number(reqBody.doctorId) || 1,
            symptoms: reqBody.symptoms || 'Khám định kỳ',
            diagnosis: reqBody.diagnosis || 'Theo dõi',
            dentalCondition: reqBody.dentalCondition || 'Bình thường',
            treatment: reqBody.treatment || 'Vệ sinh răng miệng',
            prescription: reqBody.prescription || 'Không có',
            followUpDate: reqBody.followUpDate || '2026-10-01',
            createdAt: new Date().toISOString(),
            patient: store.patients.find((p: any) => p.id === Number(reqBody.patientId)) || store.patients[0],
            doctor: store.doctors.find((d: any) => d.id === Number(reqBody.doctorId)) || store.doctors[0]
          };
          store.medicalRecords.unshift(newRecord);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Tạo hồ sơ bệnh án thành công', data: newRecord } });
        }
      }

      // --- TREATMENTS ---
      if (url.includes('/treatments')) {
        if (method === 'get') {
          return Promise.resolve({ data: { success: true, data: store.treatments } });
        }
        if (method === 'post') {
          const newTreatment: Treatment = {
            id: Date.now(),
            patientId: Number(reqBody.patientId) || 1,
            doctorId: Number(reqBody.doctorId) || 1,
            serviceId: Number(reqBody.serviceId) || 1,
            startDate: reqBody.startDate || '2026-09-12',
            endDate: reqBody.endDate || '2027-09-12',
            cost: Number(reqBody.cost) || 1000000,
            status: 'IN_PROGRESS',
            notes: reqBody.notes || '',
            patient: store.patients.find((p: any) => p.id === Number(reqBody.patientId)) || store.patients[0],
            doctor: store.doctors.find((d: any) => d.id === Number(reqBody.doctorId)) || store.doctors[0],
            service: store.services.find((s: any) => s.id === Number(reqBody.serviceId)) || store.services[0]
          };
          store.treatments.unshift(newTreatment);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Thêm điều trị mới thành công', data: newTreatment } });
        }
      }

      // --- MEDICATIONS ---
      if (url.includes('/medications')) {
        if (method === 'get') {
          let list = [...store.medications];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((m: any) =>
              m.name?.toLowerCase().includes(q) ||
              m.category?.toLowerCase().includes(q) ||
              m.supplier?.toLowerCase().includes(q)
            );
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((m: any) => m.status === params.status);
          }
          return Promise.resolve({
            data: {
              success: true,
              data: list,
              meta: { total: list.length, page: 1, limit: 10, totalPages: 1, warnings: { lowStock: 1, outOfStock: 0, nearExpiry: 0 } }
            }
          });
        }
        if (method === 'post') {
          const newMed: Medication = {
            id: Date.now(),
            name: reqBody.name || 'Thuốc Mới',
            category: reqBody.category || 'Thuốc uống',
            unit: reqBody.unit || 'Hộp',
            quantity: Number(reqBody.quantity) || 100,
            price: Number(reqBody.price) || 50000,
            expiryDate: reqBody.expiryDate || '2027-12-31',
            supplier: reqBody.supplier || 'Nhà cung cấp',
            status: 'AVAILABLE'
          };
          store.medications.unshift(newMed);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Thêm thuốc vào kho thành công', data: newMed } });
        }
        if (method === 'put') {
          const idMatch = url.match(/\/medications\/(\d+)/);
          if (idMatch) {
            const mid = parseInt(idMatch[1]);
            const idx = store.medications.findIndex((item: any) => item.id === mid);
            if (idx !== -1) {
              store.medications[idx] = { ...store.medications[idx], ...reqBody };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật kho thuốc thành công', data: store.medications[idx] } });
            }
          }
        }
        if (method === 'delete') {
          const idMatch = url.match(/\/medications\/(\d+)/);
          if (idMatch) {
            const mid = parseInt(idMatch[1]);
            store.medications = store.medications.filter((item: any) => item.id !== mid);
            saveStore(store);
            return Promise.resolve({ data: { success: true, message: 'Xóa thuốc khỏi kho thành công' } });
          }
        }
      }

      // --- INVOICES ---
      if (url.includes('/invoices')) {
        if (method === 'get') {
          let list = [...store.invoices];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((i: any) =>
              i.invoiceCode?.toLowerCase().includes(q) ||
              i.patient?.user?.name?.toLowerCase().includes(q)
            );
          }
          if (params.status && params.status !== 'ALL') {
            list = list.filter((i: any) => i.status === params.status);
          }
          return Promise.resolve({ data: { success: true, data: list, meta: { total: list.length, page: 1, limit: 10, totalPages: 1 } } });
        }
        if (method === 'post') {
          const newInvoice: Invoice = {
            id: Date.now(),
            invoiceCode: `HD-${Date.now().toString().slice(-6)}`,
            patientId: Number(reqBody.patientId) || 1,
            invoiceDate: new Date().toISOString().split('T')[0],
            subtotal: Number(reqBody.subtotal) || 1000000,
            discount: Number(reqBody.discount) || 0,
            total: Number(reqBody.total) || 1000000,
            paidAmount: 0,
            status: 'UNPAID',
            patient: store.patients.find((p: any) => p.id === Number(reqBody.patientId)) || store.patients[0],
            items: reqBody.items || []
          };
          store.invoices.unshift(newInvoice);
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Tạo hóa đơn mới thành công', data: newInvoice } });
        }
      }

      // --- PAYMENTS ---
      if (url.includes('/payments')) {
        if (method === 'get') {
          return Promise.resolve({ data: { success: true, data: store.payments, meta: { total: store.payments.length, page: 1, limit: 10, totalPages: 1 } } });
        }
        if (method === 'post') {
          const newPayment: Payment = {
            id: Date.now(),
            paymentCode: `TT-${Date.now().toString().slice(-6)}`,
            invoiceId: Number(reqBody.invoiceId) || 1,
            amount: Number(reqBody.amount) || 500000,
            paymentMethod: reqBody.paymentMethod || 'CASH',
            paymentDate: new Date().toISOString(),
            status: 'COMPLETED',
            note: reqBody.note || 'Thanh toán thành công'
          };
          store.payments.unshift(newPayment);

          const invIdx = store.invoices.findIndex((inv: any) => inv.id === newPayment.invoiceId);
          if (invIdx !== -1) {
            store.invoices[invIdx].paidAmount = (store.invoices[invIdx].paidAmount || 0) + newPayment.amount;
            if (store.invoices[invIdx].paidAmount >= store.invoices[invIdx].total) {
              store.invoices[invIdx].status = 'PAID';
            } else {
              store.invoices[invIdx].status = 'PARTIAL';
            }
          }
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Ghi nhận thanh toán thành công', data: newPayment } });
        }
      }

      // --- USERS ---
      if (url.includes('/users')) {
        if (method === 'get') {
          let list = [...store.users];
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((u: any) =>
              u.name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q) ||
              u.phone?.includes(q)
            );
          }
          if (params.role && params.role !== 'ALL') {
            list = list.filter((u: any) => u.role === params.role);
          }
          return Promise.resolve({ data: { success: true, data: list } });
        }
        if (method === 'patch' || method === 'put') {
          const idMatch = url.match(/\/users\/(\d+)/);
          if (idMatch) {
            const uid = parseInt(idMatch[1]);
            const idx = store.users.findIndex((item: any) => item.id === uid);
            if (idx !== -1) {
              store.users[idx] = { ...store.users[idx], ...reqBody };
              saveStore(store);
              return Promise.resolve({ data: { success: true, message: 'Cập nhật người dùng thành công', data: store.users[idx] } });
            }
          }
        }
      }

      // --- NOTIFICATIONS ---
      if (url.includes('/notifications')) {
        if (method === 'get') {
          return Promise.resolve({ data: { success: true, data: store.notifications } });
        }
        if (method === 'patch' || method === 'put') {
          store.notifications.forEach((n: any) => { n.isRead = true; });
          saveStore(store);
          return Promise.resolve({ data: { success: true, message: 'Đã đánh dấu đã đọc tất cả thông báo' } });
        }
      }

      // --- DASHBOARD ADMIN ---
      if (url.includes('/dashboard/admin')) {
        const totalRevenue = store.invoices.reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0);
        return Promise.resolve({
          data: {
            success: true,
            data: {
              cards: {
                totalPatients: store.patients.length,
                totalDoctors: store.doctors.length,
                todayAppointments: store.appointments.length,
                pendingAppointments: store.appointments.filter((a: any) => a.status === 'PENDING').length,
                activeTreatments: store.treatments.filter((t: any) => t.status === 'IN_PROGRESS').length,
                monthlyRevenue: totalRevenue || 185000000,
              },
              charts: {
                revenue: [
                  { label: 'Tháng 4', revenue: 120000000 },
                  { label: 'Tháng 5', revenue: 135000000 },
                  { label: 'Tháng 6', revenue: 150000000 },
                  { label: 'Tháng 7', revenue: 140000000 },
                  { label: 'Tháng 8', revenue: 165000000 },
                  { label: 'Tháng 9', revenue: totalRevenue || 185000000 },
                ],
                appointmentStatus: [
                  { status: 'Đã xác nhận', count: store.appointments.filter((a: any) => a.status === 'CONFIRMED').length || 1 },
                  { status: 'Hoàn thành', count: store.appointments.filter((a: any) => a.status === 'COMPLETED').length || 1 },
                  { status: 'Chờ duyệt', count: store.appointments.filter((a: any) => a.status === 'PENDING').length || 1 },
                  { status: 'Đã hủy', count: store.appointments.filter((a: any) => a.status === 'CANCELLED').length || 0 },
                ],
                patientGrowth: [
                  { period: 'T5', count: 12 },
                  { period: 'T6', count: 18 },
                  { period: 'T7', count: 25 },
                  { period: 'T8', count: 32 },
                  { period: 'T9', count: store.patients.length || 45 },
                ],
                popularServices: [
                  { name: 'Khám & Tư Vấn Tổng Quát', count: 48, totalRevenue: 7200000 },
                  { name: 'Cạo Vôi & Đánh Bóng Răng', count: 35, totalRevenue: 12250000 },
                  { name: 'Tẩy Trắng Răng Laser Whitening', count: 50, totalRevenue: 90000000 },
                  { name: 'Trám Răng Composite Thẩm Mỹ', count: 22, totalRevenue: 8800000 },
                  { name: 'Niềng Răng Mắc Cài Kim Loại', count: 15, totalRevenue: 420000000 },
                ],
              },
              recentAppointments: store.appointments.slice(0, 5),
            }
          }
        });
      }

      // --- DASHBOARD PATIENT ---
      if (url.includes('/dashboard/patient')) {
        const unpaidInvoices = store.invoices.filter((i: any) => i.status !== 'PAID');
        const unpaidAmount = unpaidInvoices.reduce((sum: number, i: any) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0);

        return Promise.resolve({
          data: {
            success: true,
            data: {
              upcomingAppointment: store.appointments[0] || null,
              activeTreatment: store.treatments[0] || null,
              lastVisit: store.medicalRecords[0] || null,
              unpaidInvoicesCount: unpaidInvoices.length,
              totalUnpaidAmount: unpaidAmount,
            }
          }
        });
      }

      // --- REPORTS & DASHBOARD ---
      if (url.includes('/reports')) {
        const totalRevenue = store.invoices.reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0);
        return Promise.resolve({
          data: {
            success: true,
            data: {
              summary: {
                totalPatients: store.patients.length,
                totalAppointments: store.appointments.length,
                revenueThisMonth: totalRevenue || 185000000,
                growthRate: 18.5
              },
              monthlyRevenue: [
                { month: 'T1', revenue: 120000000 }, { month: 'T2', revenue: 135000000 },
                { month: 'T3', revenue: 150000000 }, { month: 'T4', revenue: 140000000 },
                { month: 'T5', revenue: 165000000 }, { month: 'T6', revenue: totalRevenue || 185000000 },
              ],
              appointmentsByStatus: [
                { status: 'CONFIRMED', count: store.appointments.filter((a: any) => a.status === 'CONFIRMED').length || 1 },
                { status: 'COMPLETED', count: store.appointments.filter((a: any) => a.status === 'COMPLETED').length || 1 },
                { status: 'PENDING', count: store.appointments.filter((a: any) => a.status === 'PENDING').length || 1 },
                { status: 'CANCELLED', count: 0 }
              ]
            }
          }
        });
      }

      // Generic default success response
      return Promise.resolve({
        data: {
          success: true,
          message: 'Thao tác thành công (Demo Mode)',
          data: []
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;

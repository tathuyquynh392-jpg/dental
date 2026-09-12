import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Demo Fallback for Online GitHub Pages Preview
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '#/login';
      }
      return Promise.reject(error);
    }

    // Network Error Fallback (e.g. static hosting on GitHub Pages without live cloud server)
    if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();

      console.warn(`[Demo Mode] Backend API unreachable for ${method.toUpperCase()} ${url}. Using mock response for GitHub Pages preview.`);

      if (url.includes('/auth/login')) {
        const body = JSON.parse(error.config?.data || '{}');
        const isAdmin = body.email?.includes('admin');
        const user = {
          id: isAdmin ? 'admin-1' : 'patient-1',
          email: body.email || (isAdmin ? 'admin@luckydental.com' : 'patient@luckydental.com'),
          fullName: isAdmin ? 'Quản Trị Viên (Admin)' : 'Nguyễn Văn An',
          role: isAdmin ? 'ADMIN' : 'PATIENT',
          phone: '0988123456',
        };
        return Promise.resolve({
          data: {
            success: true,
            message: 'Đăng nhập thành công (Demo Mode)',
            token: 'demo-jwt-token',
            data: { user, token: 'demo-jwt-token' }
          }
        });
      }

      if (url.includes('/auth/me')) {
        const saved = localStorage.getItem('user');
        const user = saved ? JSON.parse(saved) : {
          id: 'admin-1',
          email: 'admin@luckydental.com',
          fullName: 'Quản Trị Viên (Admin)',
          role: 'ADMIN',
        };
        return Promise.resolve({ data: { success: true, data: user } });
      }

      if (url.includes('/services')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 's1', name: 'Khám & Tư Vấn Tổng Quát', price: 150000, category: 'Khám tổng quát', durationMinutes: 30, description: 'Kiểm tra tình trạng răng miệng toàn diện' },
              { id: 's2', name: 'Cạo Vôi & Tẩy Trắng Răng Laser', price: 1200000, category: 'Nha khoa thẩm mỹ', durationMinutes: 60, description: 'Công nghệ Laser Whitening trắng sáng vượt trội' },
              { id: 's3', name: 'Trám Răng Composite Thẩm Mỹ', price: 350000, category: 'Điều trị', durationMinutes: 45, description: 'Trám răng màu tự nhiên bền đẹp' },
              { id: 's4', name: 'Niềng Răng Mắc Cài Kim Loại', price: 25000000, category: 'Chỉnh nha', durationMinutes: 90, description: 'Nắn chỉnh răng đều đẹp thẩm mỹ' },
              { id: 's5', name: 'Cấy Ghép Implant Hàn Quốc', price: 14000000, category: 'Phục hình', durationMinutes: 90, description: 'Thay thế răng mất chắc khỏe lâu dài' },
            ]
          }
        });
      }

      if (url.includes('/doctors')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'd1', fullName: 'BS. CKII Nguyễn Minh Tâm', title: 'Giám Đốc Chuyên Môn', specialization: 'Chỉnh Nha & Implant', experienceYears: 15, isAvailable: true },
              { id: 'd2', fullName: 'BS. CKI Trần Hương Giang', title: 'Bác Sĩ Trưởng Khoa', specialization: 'Nha Khoa Thẩm Mỹ', experienceYears: 10, isAvailable: true },
              { id: 'd3', fullName: 'BS. Lê Hoàng Nam', title: 'Bác Sĩ Chuyên Khoa', specialization: 'Điều Trị Nội Nha', experienceYears: 8, isAvailable: true },
            ]
          }
        });
      }

      if (url.includes('/appointments')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'ap1', appointmentCode: 'LKD-1001', appointmentDate: '2026-09-15T09:00:00.000Z', startTime: '09:00', endTime: '10:00', status: 'CONFIRMED', patient: { fullName: 'Nguyễn Văn An', phone: '0988123456' }, doctor: { fullName: 'BS. CKII Nguyễn Minh Tâm' }, service: { name: 'Khám & Tư Vấn Tổng Quát' } },
              { id: 'ap2', appointmentCode: 'LKD-1002', appointmentDate: '2026-09-16T14:30:00.000Z', startTime: '14:30', endTime: '15:30', status: 'PENDING', patient: { fullName: 'Trần Thị Mai', phone: '0912345678' }, doctor: { fullName: 'BS. CKI Trần Hương Giang' }, service: { name: 'Cạo Vôi & Tẩy Trắng Răng Laser' } },
            ],
            meta: { total: 2, page: 1, totalPages: 1 }
          }
        });
      }

      if (url.includes('/patients')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'p1', patientCode: 'BN-001', fullName: 'Nguyễn Văn An', gender: 'MALE', phone: '0988123456', email: 'an.nguyen@gmail.com', dob: '1992-05-14' },
              { id: 'p2', patientCode: 'BN-002', fullName: 'Trần Thị Mai', gender: 'FEMALE', phone: '0912345678', email: 'mai.tran@gmail.com', dob: '1995-11-20' },
            ],
            meta: { total: 2, page: 1, totalPages: 1 }
          }
        });
      }

      if (url.includes('/reports/dashboard') || url.includes('/reports')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              summary: { totalPatients: 1280, totalAppointments: 345, revenueThisMonth: 185000000, growthRate: 18.5 },
              monthlyRevenue: [
                { month: 'T1', revenue: 120000000 }, { month: 'T2', revenue: 135000000 },
                { month: 'T3', revenue: 150000000 }, { month: 'T4', revenue: 140000000 },
                { month: 'T5', revenue: 165000000 }, { month: 'T6', revenue: 185000000 },
              ],
              appointmentsByStatus: [
                { status: 'CONFIRMED', count: 180 }, { status: 'COMPLETED', count: 120 },
                { status: 'PENDING', count: 35 }, { status: 'CANCELLED', count: 10 }
              ]
            }
          }
        });
      }

      // Default generic success response
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

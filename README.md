# 🦷 LUCKY DENTAL - HỆ THỐNG QUẢN LÝ NHA KHOA TOÀN DIỆN

Slogan: **"Chăm sóc nụ cười – Kiến tạo tự tin"**

Lucky Dental là ứng dụng Web quản lý phòng khám nha khoa chuẩn Full-Stack với giao diện hiện đại, chuyên nghiệp, hỗ trợ phân quyền **ADMIN** và **PATIENT**, đồng thời cung cấp đầy đủ các chức năng quản lý bệnh nhân, bác sĩ, lịch hẹn, lịch khám dạng calendar, hồ sơ bệnh án, lộ trình điều trị, quản lý kho thuốc, hóa đơn, thanh toán và báo cáo doanh thu trực quan.

---

## 🚀 CÔNG NGHỆ SỬ DỤNG

### Frontend
- **React 18** & **TypeScript**
- **Vite** (Build tool siêu nhanh)
- **Tailwind CSS** (Thiết kế giao diện hiện đại, responsive)
- **React Router DOM v6** (Định tuyến SPA)
- **Axios** (kết nối REST API)
- **Lucide React** (Bộ icon nha khoa & quản trị)
- **Recharts** (Biểu đồ thống kê doanh thu, trạng thái & bệnh nhân)

### Backend
- **Node.js** & **Express.js** (TypeScript)
- **Prisma ORM** (Quản lý CSDL quan hệ)
- **JWT (JSON Web Token)** & **bcryptjs** (Xác thực & Mã hóa mật khẩu)
- **CORS & Custom Security Middlewares** (Phân quyền Role-based Access Control)

### Database
- **SQLite / MySQL Compatible** (Mặc định cấu hình Prisma ORM chạy SQLite zero-config, có hỗ trợ file `schema.sql` cho MySQL).

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Phân Quyền Hợp Lệ (Role-Based Access Control)
- **ADMIN**: Quyền quản trị toàn bộ hệ thống (Bệnh nhân, Bác sĩ, Dịch vụ, Lịch hẹn, Lịch khám Calendar, Bệnh án, Điều trị, Kho thuốc, Hóa đơn, Thanh toán, Tài khoản, Thông báo, Báo cáo).
- **PATIENT**: Bệnh nhân chỉ được xem và thao tác dữ liệu của chính mình (Xem dashboard cá nhân, sửa profile, đặt lịch hẹn không bị trùng giờ, hủy lịch hẹn, xem hồ sơ khám, quá trình điều trị, hóa đơn & in hóa đơn).
- **Bảo mật Backend**: Kiểm tra phân quyền trực tiếp tại tầng API middleware (trả về error `403 Forbidden` / `404 Not Found` nếu Patient cố truy cập tài nguyên khác).

### 2. Quản Lý Lịch Hẹn & Chống Trùng Khung Giờ (Double Booking Prevention)
- Khi bệnh nhân hoặc Admin đặt lịch, hệ thống tự động kiểm tra trùng khung giờ với cùng một bác sĩ.
- Lịch khám dạng **Calendar View** trực quan theo Ngày, Tuần, Tháng.

### 3. Cảnh Báo Kho Thuốc Thông Minh
- Tự động nhận diện và hiển thị cảnh báo: **Thuốc sắp hết** (SL ≤ 10), **Thuốc đã hết** (SL = 0), **Thuốc sắp hết hạn** (Hạn dùng ≤ 30 ngày).

### 4. Quản Lý Hóa Đơn & Thanh Toán Trực Tiếp
- Hỗ trợ thêm chi tiết dịch vụ thanh toán, tự động tính giảm giá, thành tiền và công nợ.
- Nút **In Hóa Đơn** (Print Invoice) định dạng chuẩn in ấn `window.print()`.

---

## 👥 TÀI KHOẢN DEMO THỬ NGHIỆM

| Role | Email | Mật Khẩu | Trang Điều Hướng |
|---|---|---|---|
| **ADMIN** | `admin@luckydental.com` | `admin123` | `/admin/dashboard` |
| **PATIENT** | `patient@luckydental.com` | `patient123` | `/patient/dashboard` |

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY PROJECT

### Yêu cầu môi trường
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Bước 1: Clone / Mở Thư Mục Project
```bash
cd demowebfinal
```

### Bước 2: Cài Đặt & Khởi Chạy Backend Express API

1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo cơ sở dữ liệu và nạp dữ liệu mẫu (Seeding):
   ```bash
   npx prisma db push
   npm run db:seed
   ```
4. Chạy Backend Server (Chế độ Development):
   ```bash
   npm run dev
   ```
   *Backend API sẽ chạy tại: `http://localhost:5000`*

### Bước 3: Cài Đặt & Khởi Chạy Frontend React Vite

1. Mở cửa sổ Terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy Frontend Development Server:
   ```bash
   npm run dev
   ```
   *Ứng dụng Web sẽ chạy tại: `http://localhost:5173`*

---

## 📁 CẤU TRÚC THƯ MỤC PROJECT

```
Lucky-Dental/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Schema definitions
│   │   └── seed.ts             # Script seed dữ liệu mẫu
│   ├── src/
│   │   ├── config/             # Kết nối Database Prisma
│   │   ├── controllers/        # Xử lý logic API (Auth, Patient, Doctor, Appointment, Invoice...)
│   │   ├── middleware/         # Middleware Auth JWT & Role Guard
│   │   ├── routes/             # Định tuyến REST API endpoints
│   │   ├── utils/              # JWT & Formatting Utilities
│   │   └── server.ts           # Server Entry Point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Common UI (Navbar, Sidebar, Modal, Table, Badge, ConfirmDialog...)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # PublicLayout, AdminLayout, PatientLayout
│   │   ├── pages/              # LandingPage, Auth Pages, Admin Pages & Patient Pages
│   │   ├── services/           # Axios API Client
│   │   ├── types/              # TypeScript Interfaces
│   │   ├── App.tsx             # Main Router Table
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql              # MySQL DDL Schema File
├── .env.example
└── README.md
```

---

## 📌 REST API ENDPOINTS

```text
POST   /api/auth/register       - Đăng ký bệnh nhân mới
POST   /api/auth/login          - Đăng nhập lấy JWT Token
GET    /api/auth/me             - Lấy thông tin tài khoản hiện tại

GET    /api/patients            - Lấy danh sách bệnh nhân (Search, Filter, Sort, Pagination)
GET    /api/patients/:id        - Chi tiết bệnh nhân (Bệnh án, Lịch hẹn, Điều trị, Hóa đơn)
POST   /api/patients            - Thêm bệnh nhân mới
PUT    /api/patients/:id        - Cập nhật thông tin bệnh nhân
DELETE /api/patients/:id        - Xóa bệnh nhân

GET    /api/doctors             - Danh sách bác sĩ
GET    /api/services            - Bảng giá dịch vụ nha khoa
GET    /api/appointments        - Danh sách lịch hẹn (Kiểm tra trùng lịch)
POST   /api/appointments        - Tạo lịch hẹn mới
PUT    /api/appointments/:id    - Cập nhật trạng thái lịch hẹn

GET    /api/medical-records     - Hồ sơ bệnh án
GET    /api/treatments          - Quá trình điều trị
GET    /api/medications         - Quản lý kho thuốc (Cảnh báo tồn kho)
GET    /api/invoices            - Quản lý hóa đơn
GET    /api/payments            - Lịch sử thu tiền thanh toán
GET    /api/users               - Quản lý tài khoản (Khóa/Mở khóa/Reset pass)
GET    /api/dashboard/admin     - Thống kê & biểu đồ Recharts cho Admin
GET    /api/dashboard/patient   - Thống kê Portal dành cho Bệnh nhân
GET    /api/reports             - Báo cáo doanh thu & hiệu suất bác sĩ
```

---

## 📝 GIẤY PHÉP & BẢO QUYỀN

Dự án thuộc sở hữu của **Lucky Dental System**. Phát triển bởi Senior Full-Stack Engineering Team.

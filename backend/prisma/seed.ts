import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Lucky Dental Database...');

  // Clean existing tables
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedPatientPassword = await bcrypt.hash('patient123', 10);

  // 1. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Quản Trị Viên (Admin)',
      email: 'admin@luckydental.com',
      phone: '0901234567',
      password: hashedAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Create Doctors (5 doctors)
  const doctorsData = [
    {
      name: 'BS. CKII Nguyễn Văn Hùng',
      email: 'hung.nguyen@luckydental.com',
      phone: '0912345678',
      specialty: 'Răng Hàm Mặt - Phục Hình & Implant',
      qualification: 'Thạc sĩ, Bác sĩ Chuyên khoa II - ĐH Y Dược TP.HCM',
      experience: '15 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Thứ 7',
      workingHours: '08:00 - 17:00',
      status: 'ACTIVE',
    },
    {
      name: 'BS. CKI Trần Thị Mai',
      email: 'mai.tran@luckydental.com',
      phone: '0923456789',
      specialty: 'Chỉnh Hình Răng Mặt - Niềng Răng',
      qualification: 'Bác sĩ CKI - Đại học Y Hà Nội',
      experience: '10 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Chủ Nhật',
      workingHours: '08:30 - 18:00',
      status: 'ACTIVE',
    },
    {
      name: 'ThS. BS Lê Hoàng Nam',
      email: 'nam.le@luckydental.com',
      phone: '0934567890',
      specialty: 'Nha Khoa Tổng Quát & Nội Nha',
      qualification: 'Thạc sĩ Nha Khoa - ĐH Y Dược TP.HCM',
      experience: '8 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Thứ 6',
      workingHours: '08:00 - 17:00',
      status: 'ACTIVE',
    },
    {
      name: 'BS. Phạm Thu Thảo',
      email: 'thao.pham@luckydental.com',
      phone: '0945678901',
      specialty: 'Nha Khoa Thẩm Mỹ & Tẩy Trắng Răng',
      qualification: 'Bác sĩ Răng Hàm Mặt - ĐH Y Dược Cần Thơ',
      experience: '6 năm kinh nghiệm',
      workingDays: 'Thứ 3 - Chủ Nhật',
      workingHours: '09:00 - 19:00',
      status: 'ACTIVE',
    },
    {
      name: 'BS. Võ Minh Trí',
      email: 'tri.vo@luckydental.com',
      phone: '0956789012',
      specialty: 'Phẫu Thuật Miệng & Nhổ Răng Khôn',
      qualification: 'Bác sĩ Chuyên khoa Răng Hàm Mặt',
      experience: '12 năm kinh nghiệm',
      workingDays: 'Thứ 2 - Thứ 7',
      workingHours: '08:00 - 16:30',
      status: 'ACTIVE',
    },
  ];

  const doctors = [];
  for (const doc of doctorsData) {
    doctors.push(await prisma.doctor.create({ data: doc }));
  }

  // 3. Create Services (10 services)
  const servicesData = [
    {
      name: 'Khám tổng quát & Tư vấn',
      description: 'Khám kiểm tra toàn diện sức khỏe răng miệng, chụp X-quang và tư vấn lộ trình điều trị.',
      price: 100000,
      duration: 30,
      status: 'ACTIVE',
    },
    {
      name: 'Lấy cao răng & Đánh bóng',
      description: 'Cạo vôi răng bằng sóng siêu âm hiện đại, không đau, giúp sạch mảng bám và thơm miệng.',
      price: 250000,
      duration: 45,
      status: 'ACTIVE',
    },
    {
      name: 'Trám răng thẩm mỹ Composite',
      description: 'Phục hồi răng sâu, răng sứt mỏng bằng vật liệu Composite trùng màu răng tự nhiên.',
      price: 400000,
      duration: 45,
      status: 'ACTIVE',
    },
    {
      name: 'Nhổ răng khôn (Răng số 8)',
      description: 'Nhổ răng khôn mọc lệch, mọc ngầm bằng công nghệ Piezotome siêu âm nhẹ nhàng.',
      price: 1500000,
      duration: 60,
      status: 'ACTIVE',
    },
    {
      name: 'Điều trị tủy răng',
      description: 'Chữa tủy bảo tồn răng thật, làm sạch ống tủy và trám bít kín khít.',
      price: 1200000,
      duration: 60,
      status: 'ACTIVE',
    },
    {
      name: 'Tẩy trắng răng công nghệ Laser',
      description: 'Tẩy trắng răng chuẩn y khoa với công nghệ Laser Whitening bật tông nhanh chóng.',
      price: 2500000,
      duration: 60,
      status: 'ACTIVE',
    },
    {
      name: 'Niềng răng mắc cài kim loại',
      description: 'Nắn chỉnh răng đều đẹp, chuẩn khớp cấm với hệ thống mắc cài cao cấp.',
      price: 25000000,
      duration: 90,
      status: 'ACTIVE',
    },
    {
      name: 'Bọc răng sứ Zirconia',
      description: 'Bọc răng sứ toàn sứ Zirconia chính hãng, chịu lực cao, bảo hành 10 năm.',
      price: 4500000,
      duration: 60,
      status: 'ACTIVE',
    },
    {
      name: 'Trồng răng Implant Straumann',
      description: 'Cấy ghép trụ Implant Thụy Sĩ cao cấp phục hồi răng đã mất vĩnh viễn.',
      price: 18000000,
      duration: 90,
      status: 'ACTIVE',
    },
    {
      name: 'Dán sứ Veneer mỏng nhẹ',
      description: 'Mặt dán sứ siêu mỏng không mài nhiều răng thật, nâng tầm nụ cười rạng rỡ.',
      price: 6000000,
      duration: 60,
      status: 'ACTIVE',
    },
  ];

  const services = [];
  for (const s of servicesData) {
    services.push(await prisma.service.create({ data: s }));
  }

  // 4. Create Patients (10 patients)
  const patientUsersData = [
    {
      name: 'Nguyễn Văn An',
      email: 'patient@luckydental.com', // Demo Patient account
      phone: '0987654321',
      dob: '1995-05-15',
      gender: 'Nam',
      address: '123 Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh',
      history: 'Không có tiền sử bệnh lý nghiêm trọng',
      allergy: 'Dị ứng Penicillin nhẹ',
      notes: 'Bệnh nhân quan tâm dịch vụ tẩy trắng răng',
    },
    {
      name: 'Trần Thị Bình',
      email: 'binh.tran@gmail.com',
      phone: '0978123456',
      dob: '1998-08-20',
      gender: 'Nữ',
      address: '456 Lê Văn Sỹ, Quận 3, TP. Hồ Chí Minh',
      history: 'Từng trám răng số 36',
      allergy: 'Không',
      notes: 'Đang theo dõi niềng răng',
    },
    {
      name: 'Lê Minh Cường',
      email: 'cuong.le@gmail.com',
      phone: '0967234567',
      dob: '1990-11-03',
      gender: 'Nam',
      address: '789 Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh',
      history: 'Cao huyết áp nhẹ',
      allergy: 'Không',
      notes: 'Cần nhổ răng khôn mọc lệch',
    },
    {
      name: 'Phạm Thị Dung',
      email: 'dung.pham@gmail.com',
      phone: '0956345678',
      dob: '2001-02-12',
      gender: 'Nữ',
      address: '12 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
      history: 'Không',
      allergy: 'Không',
      notes: 'Lấy cao răng định kỳ',
    },
    {
      name: 'Hoàng Anh Tuấn',
      email: 'tuan.hoang@gmail.com',
      phone: '0945456789',
      dob: '1985-09-30',
      gender: 'Nam',
      address: '99 CMT8, Quận 10, TP. Hồ Chí Minh',
      history: 'Mất răng số 46',
      allergy: 'Không',
      notes: 'Tư vấn trồng Implant',
    },
    {
      name: 'Đặng Ngọc Hương',
      email: 'huong.dang@gmail.com',
      phone: '0934567891',
      dob: '1993-07-25',
      gender: 'Nữ',
      address: '234 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
      history: 'Sâu răng nhẹ',
      allergy: 'Dị ứng phấn hoa',
      notes: 'Bọc sứ 4 răng cửa',
    },
    {
      name: 'Vũ Quốc Khánh',
      email: 'khanh.vu@gmail.com',
      phone: '0923678912',
      dob: '1988-12-18',
      gender: 'Nam',
      address: '56 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
      history: 'Đã chữa tủy răng 16',
      allergy: 'Không',
      notes: 'Tái khám điều trị tủy',
    },
    {
      name: 'Bùi Thị Lan',
      email: 'lan.bui@gmail.com',
      phone: '0912789123',
      dob: '1997-04-05',
      gender: 'Nữ',
      address: '88 Phan Xích Long, Quận Phú Nhuận, TP. Hồ Chí Minh',
      history: 'Không',
      allergy: 'Không',
      notes: 'Niềng răng mắc cài',
    },
    {
      name: 'Đỗ Văn Minh',
      email: 'minh.do@gmail.com',
      phone: '0901890123',
      dob: '1992-06-22',
      gender: 'Nam',
      address: '150 Hoàng Văn Thụ, Quận Tân Bình, TP. Hồ Chí Minh',
      history: 'Viêm nướu',
      allergy: 'Không',
      notes: 'Điều trị viêm nướu',
    },
    {
      name: 'Ngô Thanh Hà',
      email: 'ha.ngo@gmail.com',
      phone: '0990901234',
      dob: '2000-10-10',
      gender: 'Nữ',
      address: '77 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      history: 'Không',
      allergy: 'Không',
      notes: 'Tẩy trắng răng Laser',
    },
  ];

  const patients = [];
  for (const p of patientUsersData) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        password: hashedPatientPassword,
        role: 'PATIENT',
        status: 'ACTIVE',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: p.dob,
        gender: p.gender,
        address: p.address,
        medicalHistory: p.history,
        allergy: p.allergy,
        notes: p.notes,
      },
    });
    patients.push(patient);
  }

  // 5. Create Appointments (20 appointments)
  const appointmentsData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, serviceId: services[1].id, date: '2026-09-10', time: '09:00', status: 'COMPLETED', notes: 'Bệnh nhân đến đúng giờ' },
    { patientId: patients[0].id, doctorId: doctors[3].id, serviceId: services[5].id, date: '2026-09-15', time: '10:30', status: 'CONFIRMED', notes: 'Hẹn tẩy trắng răng' },
    { patientId: patients[1].id, doctorId: doctors[1].id, serviceId: services[6].id, date: '2026-09-12', time: '14:00', status: 'CONFIRMED', notes: 'Tái khám niềng răng hàng tháng' },
    { patientId: patients[2].id, doctorId: doctors[4].id, serviceId: services[3].id, date: '2026-09-12', time: '15:30', status: 'PENDING', notes: 'Đau răng khôn dưới bên phải' },
    { patientId: patients[3].id, doctorId: doctors[2].id, serviceId: services[0].id, date: '2026-09-12', time: '09:30', status: 'COMPLETED', notes: 'Khám răng tổng quát' },
    { patientId: patients[4].id, doctorId: doctors[0].id, serviceId: services[8].id, date: '2026-09-13', time: '08:30', status: 'CONFIRMED', notes: 'Phẫu thuật cấy Implant' },
    { patientId: patients[5].id, doctorId: doctors[3].id, serviceId: services[7].id, date: '2026-09-14', time: '11:00', status: 'PENDING', notes: 'Muốn bọc 4 răng sứ' },
    { patientId: patients[6].id, doctorId: doctors[2].id, serviceId: services[4].id, date: '2026-09-08', time: '16:00', status: 'COMPLETED', notes: 'Điều trị tủy buổi 2' },
    { patientId: patients[7].id, doctorId: doctors[1].id, serviceId: services[6].id, date: '2026-09-16', time: '09:00', status: 'CONFIRMED', notes: 'Gắn mắc cài hàm dưới' },
    { patientId: patients[8].id, doctorId: doctors[2].id, serviceId: services[1].id, date: '2026-09-05', time: '10:00', status: 'COMPLETED', notes: 'Lấy cao răng' },
    { patientId: patients[9].id, doctorId: doctors[3].id, serviceId: services[5].id, date: '2026-09-11', time: '13:30', status: 'COMPLETED', notes: 'Tẩy trắng thành công' },
    { patientId: patients[1].id, doctorId: doctors[0].id, serviceId: services[2].id, date: '2026-09-01', time: '15:00', status: 'COMPLETED', notes: 'Trám răng sứt' },
    { patientId: patients[3].id, doctorId: doctors[2].id, serviceId: services[2].id, date: '2026-09-17', time: '14:30', status: 'PENDING', notes: 'Trám 2 răng sâu' },
    { patientId: patients[4].id, doctorId: doctors[4].id, serviceId: services[3].id, date: '2026-08-25', time: '10:00', status: 'COMPLETED', notes: 'Đã nhổ răng khôn' },
    { patientId: patients[5].id, doctorId: doctors[0].id, serviceId: services[0].id, date: '2026-09-02', time: '09:00', status: 'CANCELLED', notes: 'Bệnh nhân bận công tác' },
    { patientId: patients[6].id, doctorId: doctors[2].id, serviceId: services[4].id, date: '2026-08-20', time: '15:00', status: 'COMPLETED', notes: 'Mở tủy diệt tủy' },
    { patientId: patients[7].id, doctorId: doctors[1].id, serviceId: services[0].id, date: '2026-08-15', time: '11:00', status: 'COMPLETED', notes: 'Tư vấn niềng' },
    { patientId: patients[8].id, doctorId: doctors[4].id, serviceId: services[3].id, date: '2026-09-18', time: '16:00', status: 'PENDING', notes: 'Nhổ răng 38' },
    { patientId: patients[9].id, doctorId: doctors[3].id, serviceId: services[9].id, date: '2026-09-20', time: '10:00', status: 'CONFIRMED', notes: 'Dán Veneer 2 răng cửa' },
    { patientId: patients[0].id, doctorId: doctors[2].id, serviceId: services[0].id, date: '2026-08-10', time: '08:30', status: 'COMPLETED', notes: 'Khám định kỳ' },
  ];

  const appointments = [];
  for (const app of appointmentsData) {
    appointments.push(
      await prisma.appointment.create({
        data: {
          patientId: app.patientId,
          doctorId: app.doctorId,
          serviceId: app.serviceId,
          appointmentDate: app.date,
          appointmentTime: app.time,
          status: app.status,
          notes: app.notes,
        },
      })
    );
  }

  // 6. Create Medical Records (10 records)
  const medicalRecordsData = [
    {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      appointmentId: appointments[0].id,
      symptoms: 'Vôi răng nhiều, nướu rỉ máu nhẹ khi chải răng',
      diagnosis: 'Viêm nướu do vôi răng mảng bám',
      dentalCondition: 'Răng 11-47 có vôi răng độ 2',
      treatment: 'Cạo vôi răng sóng siêu âm + Đánh bóng toàn hàm',
      notes: 'Vệ sinh răng miệng đúng cách bằng chỉ nha khoa',
      prescription: 'Nước súc miệng Chlorohexidine 0.12%, Amoxicillin 500mg',
      followUpDate: '2026-03-10',
    },
    {
      patientId: patients[1].id,
      doctorId: doctors[1].id,
      appointmentId: appointments[2].id,
      symptoms: 'Răng lệch lạc hàm trên và hàm dưới',
      diagnosis: 'Sai khớp cấm độ I, chen chúc răng',
      dentalCondition: 'Cung răng hẹp, răng 12, 22 mọc lệch trong',
      treatment: 'Gắn mắc cài kim loại 2 hàm + Thay thun định kỳ',
      notes: 'Tái khám đúng hẹn mỗi tháng',
      prescription: 'Sáp nha khoa giảm cọ xát, Paracetamol 500mg (nếu đau)',
      followUpDate: '2026-10-12',
    },
    {
      patientId: patients[2].id,
      doctorId: doctors[4].id,
      appointmentId: appointments[3].id,
      symptoms: 'Đau sưng vùng góc hàm dưới bên phải',
      diagnosis: 'Răng khôn 38 mọc lệch 90 độ gây viêm lợi trùm',
      dentalCondition: 'Răng 38 mọc kẹt chân răng 37',
      treatment: 'Bơm rửa lợi trùm, kê đơn kháng sinh chuẩn bị nhổ',
      notes: 'Chờ hết sưng tái khám nhổ bằng Piezotome',
      prescription: 'Augmentin 1g, Alphachymotrypsin, Efferalgan 500mg',
      followUpDate: '2026-09-18',
    },
    {
      patientId: patients[3].id,
      doctorId: doctors[2].id,
      appointmentId: appointments[4].id,
      symptoms: 'Sâu răng hàm dưới, buốt nhẹ khi uống nước lạnh',
      diagnosis: 'Sâu ngà nông răng 46',
      dentalCondition: 'Lỗ sâu màu nâu đen ở mặt chewing răng 46',
      treatment: 'Nạo sạch tổ chức sâu + Trám răng Composite SonicFill',
      notes: 'Đã hoàn thành trám, ngưng ăn đồ quá cứng trong 24h',
      prescription: 'Không cần dùng thuốc',
      followUpDate: '2027-03-12',
    },
    {
      patientId: patients[4].id,
      doctorId: doctors[0].id,
      appointmentId: appointments[5].id,
      symptoms: 'Mất răng 46 từ 2 năm trước, nhai khó khăn',
      diagnosis: 'Mất răng 46 vĩnh viễn, tiêu xương ổ răng nhẹ',
      dentalCondition: 'Khoảng mất răng 46 rộng 8mm',
      treatment: 'Cấy ghép 01 trụ Implant Straumann + Ghép xương nhân tạo',
      notes: 'Uống thuốc đúng liều, không hút thuốc lá',
      prescription: 'Cefuroxime 500mg, Medrol 16mg, Ultracet',
      followUpDate: '2026-09-20',
    },
    {
      patientId: patients[6].id,
      doctorId: doctors[2].id,
      appointmentId: appointments[7].id,
      symptoms: 'Đau nhức dữ dội về đêm ở răng 16',
      diagnosis: 'Viêm tủy cấp tính răng 16',
      dentalCondition: 'Tủy răng 16 hoại tử một phần',
      treatment: 'Làm sạch 3 ống tủy, đặt thuốc Ca(OH)2 diệt khuẩn',
      notes: 'Hẹn tái khám trám bít ống tủy',
      prescription: 'Rodogyl, Panadol Extra',
      followUpDate: '2026-09-22',
    },
    {
      patientId: patients[8].id,
      doctorId: doctors[2].id,
      appointmentId: appointments[9].id,
      symptoms: 'Hôi miệng, vôi răng tích tụ',
      diagnosis: 'Viêm nướu nhẹ',
      dentalCondition: 'Vôi răng tập trung hàm dưới',
      treatment: 'Cạo vôi răng siêu âm',
      notes: 'Đã hoàn thành cạo vôi',
      prescription: 'Nước súc miệng Kin Gingival',
      followUpDate: '2027-03-05',
    },
    {
      patientId: patients[9].id,
      doctorId: doctors[3].id,
      appointmentId: appointments[10].id,
      symptoms: 'Răng ố vàng do uống trà và cà phê',
      diagnosis: 'Nhiễm màu thực phẩm trên bề mặt men răng',
      dentalCondition: 'Men răng chắc khỏe, màu Vita A3',
      treatment: 'Tẩy trắng răng Laser Whitening tại phòng khám',
      notes: 'Bật lên tông Vita A1, kiêng đồ có màu 7 ngày',
      prescription: 'Gel chống ê buốt Tooth Mousse',
      followUpDate: '2027-09-11',
    },
    {
      patientId: patients[1].id,
      doctorId: doctors[0].id,
      appointmentId: appointments[11].id,
      symptoms: 'Mẻ góc răng cửa 11 do chấn thương nhẹ',
      diagnosis: 'Gãy men răng 11',
      dentalCondition: 'Mẻ góc cắn 2mm răng 11',
      treatment: 'Trám thẩm mỹ răng 11 bằng 3M Filtek Z350',
      notes: 'Răng thẩm mỹ đẹp tự nhiên',
      prescription: 'Không',
      followUpDate: '2026-12-01',
    },
    {
      patientId: patients[4].id,
      doctorId: doctors[4].id,
      appointmentId: appointments[13].id,
      symptoms: 'Răng khôn 48 mọc ngầm đâm vào răng 47',
      diagnosis: 'Răng 48 mọc kẹt xương hàm',
      dentalCondition: 'Phim X-quang cho thấy răng 48 mọc lệch 45度',
      treatment: 'Nhổ răng khôn 48 mở vạt khâu 2 mũi',
      notes: 'Cắt chỉ sau 7 ngày',
      prescription: 'Zinnat 500mg, Cataflam 50mg',
      followUpDate: '2026-09-01',
    },
  ];

  for (const mr of medicalRecordsData) {
    await prisma.medicalRecord.create({ data: mr });
  }

  // 7. Create Treatments (10 treatments)
  const treatmentsData = [
    { patientId: patients[0].id, doctorId: doctors[3].id, serviceId: services[5].id, startDate: '2026-09-10', endDate: '2026-09-15', cost: 2500000, status: 'IN_PROGRESS', notes: 'Lộ trình tẩy trắng 2 giai đoạn' },
    { patientId: patients[1].id, doctorId: doctors[1].id, serviceId: services[6].id, startDate: '2026-08-01', endDate: '2028-08-01', cost: 25000000, status: 'IN_PROGRESS', notes: 'Kế hoạch niềng răng 24 tháng' },
    { patientId: patients[2].id, doctorId: doctors[4].id, serviceId: services[3].id, startDate: '2026-09-12', endDate: '2026-09-18', cost: 1500000, status: 'NOT_STARTED', notes: 'Kế hoạch nhổ răng khôn' },
    { patientId: patients[3].id, doctorId: doctors[2].id, serviceId: services[2].id, startDate: '2026-09-12', endDate: '2026-09-12', cost: 400000, status: 'COMPLETED', notes: 'Trám răng sâu 46' },
    { patientId: patients[4].id, doctorId: doctors[0].id, serviceId: services[8].id, startDate: '2026-09-13', endDate: '2026-12-13', cost: 18000000, status: 'IN_PROGRESS', notes: 'Cấy Implant Straumann 3 tháng tích hợp xương' },
    { patientId: patients[5].id, doctorId: doctors[3].id, serviceId: services[7].id, startDate: '2026-09-20', endDate: '2026-09-27', cost: 18000000, status: 'NOT_STARTED', notes: 'Bọc 4 răng sứ Zirconia' },
    { patientId: patients[6].id, doctorId: doctors[2].id, serviceId: services[4].id, startDate: '2026-08-20', endDate: '2026-09-22', cost: 1200000, status: 'IN_PROGRESS', notes: 'Điều trị tủy 3 buổi' },
    { patientId: patients[7].id, doctorId: doctors[1].id, serviceId: services[6].id, startDate: '2026-09-16', endDate: '2028-09-16', cost: 25000000, status: 'NOT_STARTED', notes: 'Niềng mắc cài kim loại' },
    { patientId: patients[8].id, doctorId: doctors[2].id, serviceId: services[1].id, startDate: '2026-09-05', endDate: '2026-09-05', cost: 250000, status: 'COMPLETED', notes: 'Lấy cao răng' },
    { patientId: patients[9].id, doctorId: doctors[3].id, serviceId: services[5].id, startDate: '2026-09-11', endDate: '2026-09-11', cost: 2500000, status: 'COMPLETED', notes: 'Tẩy trắng Laser' },
  ];

  for (const tr of treatmentsData) {
    await prisma.treatment.create({ data: tr });
  }

  // 8. Create Medications (10 medications)
  const medicationsData = [
    { name: 'Amoxicillin 500mg', category: 'Kháng sinh', unit: 'Viên', quantity: 500, price: 3000, expiryDate: '2027-12-31', supplier: 'Dược Hậu Giang', status: 'AVAILABLE' },
    { name: 'Augmentin 1g', category: 'Kháng sinh', unit: 'Hộp', quantity: 15, price: 220000, expiryDate: '2027-08-15', supplier: 'GSK', status: 'AVAILABLE' },
    { name: 'Paracetamol 500mg', category: 'Giảm đau hạ sốt', unit: 'Viên', quantity: 800, price: 1500, expiryDate: '2028-01-01', supplier: 'Pharmacity', status: 'AVAILABLE' },
    { name: 'Efferalgan Codeine', category: 'Giảm đau nặng', unit: 'Hộp', quantity: 8, price: 140000, expiryDate: '2026-10-01', supplier: 'Sanofi', status: 'LOW_STOCK' },
    { name: 'Alphachymotrypsin', category: 'Kháng viêm kháng phù nề', unit: 'Hộp', quantity: 5, price: 75000, expiryDate: '2026-09-30', supplier: 'Dược Bình Định', status: 'LOW_STOCK' },
    { name: 'Rodogyl', category: 'Kháng sinh nha khoa', unit: 'Hộp', quantity: 0, price: 180000, expiryDate: '2027-05-20', supplier: 'Sanofi', status: 'OUT_OF_STOCK' },
    { name: 'Kin Gingival Mouthwash', category: 'Nước súc miệng điều trị', unit: 'Chai', quantity: 45, price: 135000, expiryDate: '2026-10-15', supplier: 'Kin Spain', status: 'AVAILABLE' },
    { name: 'Sáp nha khoa VITIS', category: 'Vật tư chỉnh nha', unit: 'Hộp', quantity: 60, price: 45000, expiryDate: '2028-06-30', supplier: 'DENTAID', status: 'AVAILABLE' },
    { name: 'Cataflam 50mg', category: 'Kháng viêm giảm đau', unit: 'Hộp', quantity: 4, price: 95000, expiryDate: '2026-09-25', supplier: 'Novartis', status: 'LOW_STOCK' },
    { name: 'Tooth Mousse Gel', category: 'Gel chống ê buốt', unit: 'Tuýp', quantity: 20, price: 280000, expiryDate: '2026-10-10', supplier: 'GC Japan', status: 'AVAILABLE' },
  ];

  for (const med of medicationsData) {
    await prisma.medication.create({ data: med });
  }

  // 9. Create Invoices & Payments (20 Invoices, 10 Payments)
  for (let i = 0; i < 20; i++) {
    const pIndex = i % patients.length;
    const sIndex = i % services.length;
    const service = services[sIndex];
    const discount = i % 3 === 0 ? 50000 : 0;
    const total = service.price - discount;
    const paidAmount = i % 2 === 0 ? total : (i % 4 === 0 ? total / 2 : 0);
    let status = 'UNPAID';
    if (paidAmount >= total) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIAL';

    const invoice = await prisma.invoice.create({
      data: {
        invoiceCode: `HD-2026-${1000 + i}`,
        patientId: patients[pIndex].id,
        appointmentId: appointments[i % appointments.length].id,
        invoiceDate: `2026-09-${(i % 12) + 1 < 10 ? '0' + ((i % 12) + 1) : (i % 12) + 1}`,
        subtotal: service.price,
        discount: discount,
        total: total,
        paidAmount: paidAmount,
        status: status,
      },
    });

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        serviceId: service.id,
        description: service.name,
        quantity: 1,
        unitPrice: service.price,
        amount: service.price,
      },
    });

    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          paymentCode: `TT-2026-${5000 + i}`,
          invoiceId: invoice.id,
          amount: paidAmount,
          paymentMethod: i % 3 === 0 ? 'CASH' : (i % 3 === 1 ? 'TRANSFER' : 'CARD'),
          paymentDate: invoice.invoiceDate,
          status: 'COMPLETED',
          note: 'Thanh toán trực tiếp tại quầy thu ngân Lucky Dental',
        },
      });
    }
  }

  // 10. Create Notifications
  const sampleNotifications = [
    { userId: adminUser.id, title: 'Lịch hẹn mới', message: 'Bệnh nhân Nguyễn Văn An vừa đặt lịch hẹn khám ngày 15/09/2026.' },
    { userId: adminUser.id, title: 'Cảnh báo kho thuốc', message: 'Thuốc Rodogyl đã hết hàng trong kho. Vui lòng nhập thêm.' },
    { userId: patients[0].userId, title: 'Xác nhận lịch hẹn', message: 'Lịch hẹn khám Tẩy trắng răng ngày 15/09/2026 lúc 10:30 đã được xác nhận.' },
    { userId: patients[0].userId, title: 'Nhắc nhở tái khám', message: 'Bạn có lịch hẹn khám răng vào ngày 15/09/2026. Vui lòng đến đúng giờ.' },
    { userId: patients[1].userId, title: 'Thông báo thanh toán', message: 'Hóa đơn HD-2026-1002 niềng răng đã được thanh toán một phần.' },
  ];

  for (const notif of sampleNotifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Admin: admin@luckydental.com / admin123');
  console.log('  Patient: patient@luckydental.com / patient123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

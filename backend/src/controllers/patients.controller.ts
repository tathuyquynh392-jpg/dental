import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getPatients = async (req: any, res: Response) => {
  try {
    const { search, gender, status, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Security check for PATIENT role
    if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { userId: req.user.userId },
        include: { user: true },
      });
      if (!patient) return sendSuccess(res, [], 'Thành công', 200, { total: 0, page: 1, totalPages: 0 });
      return sendSuccess(res, [patient], 'Thành công', 200, { total: 1, page: 1, totalPages: 1 });
    }

    const where: any = {};

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { user: { name: { contains: searchStr } } },
        { user: { email: { contains: searchStr } } },
        { user: { phone: { contains: searchStr } } },
      ];
    }

    if (gender && gender !== 'ALL') {
      where.gender = String(gender);
    }

    if (status && status !== 'ALL') {
      where.user = { ...where.user, status: String(status) };
    }

    // Build orderBy
    let orderBy: any = {};
    if (sort === 'name') {
      orderBy = { user: { name: order === 'asc' ? 'asc' : 'desc' } };
    } else {
      orderBy = { [sort as string]: order === 'asc' ? 'asc' : 'desc' };
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, patients, 'Danh sách bệnh nhân', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách bệnh nhân', 500);
  }
};

export const getPatientById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Patient can only access their own record
    if (req.user?.role === 'PATIENT' && req.user.patientId !== id) {
      return sendError(res, 'Bạn không có quyền xem thông tin của bệnh nhân khác', 403);
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
        },
        appointments: {
          include: { doctor: true, service: true },
          orderBy: { appointmentDate: 'desc' },
        },
        medicalRecords: {
          include: { doctor: true },
          orderBy: { createdAt: 'desc' },
        },
        treatments: {
          include: { doctor: true, service: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return sendError(res, 'Không tìm thấy bệnh nhân', 404);
    }

    return sendSuccess(res, patient, 'Chi tiết bệnh nhân');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, dateOfBirth, gender, address, medicalHistory, allergy, notes, password } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !phone || !phone.trim() || !dateOfBirth || !gender || !address || !address.trim()) {
      return sendError(res, 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 400);
    }

    // Phone format regex
    const phoneRegex = /^[0-9+\s-]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return sendError(res, 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)', 400);
    }

    // Email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return sendError(res, 'Địa chỉ email không đúng định dạng (VD: example@domain.com)', 400);
    }

    // Date of birth validation
    if (new Date(dateOfBirth) > new Date()) {
      return sendError(res, 'Ngày sinh không thể nằm ở tương lai', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return sendError(res, 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.', 409);
    }

    const hashedPassword = await bcrypt.hash(password || 'patient123', 10);

    const patient = await prisma.patient.create({
      data: {
        dateOfBirth,
        gender: gender || 'Nam',
        address: address.trim(),
        medicalHistory: medicalHistory?.trim() || '',
        allergy: allergy?.trim() || '',
        notes: notes?.trim() || '',
        user: {
          create: {
            name: name.trim(),
            email: cleanEmail,
            phone: phone.trim(),
            password: hashedPassword,
            role: 'PATIENT',
            status: 'ACTIVE',
          },
        },
      },
      include: { user: true },
    });

    return sendSuccess(res, patient, 'Tạo bệnh nhân thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo bệnh nhân', 500);
  }
};

export const updatePatient = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendError(res, 'ID bệnh nhân không hợp lệ', 400);
    }

    const { name, email, phone, dateOfBirth, gender, address, medicalHistory, allergy, notes, status } = req.body;

    // Patient scope restriction
    if (req.user?.role === 'PATIENT' && req.user.patientId !== id) {
      return sendError(res, 'Bạn không có quyền chỉnh sửa thông tin của người khác', 403);
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return sendError(res, 'Không tìm thấy bệnh nhân', 404);

    if (phone) {
      const phoneRegex = /^[0-9+\s-]{9,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        return sendError(res, 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)', 400);
      }
    }

    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
      return sendError(res, 'Ngày sinh không thể nằm ở tương lai', 400);
    }

    // Update patient record
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        dateOfBirth: dateOfBirth ?? patient.dateOfBirth,
        gender: gender ?? patient.gender,
        address: address ? address.trim() : patient.address,
        medicalHistory: req.user?.role === 'ADMIN' ? (medicalHistory ?? patient.medicalHistory) : patient.medicalHistory,
        allergy: req.user?.role === 'ADMIN' ? (allergy ?? patient.allergy) : patient.allergy,
        notes: req.user?.role === 'ADMIN' ? (notes ?? patient.notes) : patient.notes,
        user: {
          update: {
            name: name ? name.trim() : undefined,
            phone: phone ? phone.trim() : undefined,
            status: req.user?.role === 'ADMIN' ? (status ?? undefined) : undefined,
          },
        },
      },
      include: { user: true },
    });

    return sendSuccess(res, updatedPatient, 'Cập nhật thông tin bệnh nhân thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật bệnh nhân', 500);
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendError(res, 'ID bệnh nhân không hợp lệ', 400);
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return sendError(res, 'Không tìm thấy bệnh nhân', 404);

    // Perform cascade delete safely in a transaction to prevent foreign key errors
    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { patientId: id } }),
      prisma.medicalRecord.deleteMany({ where: { patientId: id } }),
      prisma.treatment.deleteMany({ where: { patientId: id } }),
      prisma.invoice.deleteMany({ where: { patientId: id } }),
      prisma.patient.delete({ where: { id } }),
      prisma.user.delete({ where: { id: patient.userId } }),
    ]);

    return sendSuccess(res, null, 'Xóa bệnh nhân thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa bệnh nhân', 500);
  }
};

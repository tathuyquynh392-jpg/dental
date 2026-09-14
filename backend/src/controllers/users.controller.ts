import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { email: { contains: searchStr } },
        { phone: { contains: searchStr } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = String(role);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          patient: true,
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, users, 'Danh sách tài khoản hệ thống', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách tài khoản', 500);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        patient: true,
      },
    });

    if (!user) return sendError(res, 'Không tìm thấy tài khoản', 404);
    return sendSuccess(res, user, 'Chi tiết tài khoản');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password, dateOfBirth, gender, address } = req.body;

    if (!name || !email || !phone || !password) {
      return sendError(res, 'Vui lòng điền Họ tên, Email, Số điện thoại và Mật khẩu', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return sendError(res, 'Email đã được sử dụng', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'PATIENT';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: userRole,
        status: 'ACTIVE',
        ...(userRole === 'PATIENT' && {
          patient: {
            create: {
              dateOfBirth: dateOfBirth || '1995-01-01',
              gender: gender || 'Nam',
              address: address || 'Chưa cập nhật',
            },
          },
        }),
      },
    });

    return sendSuccess(res, user, 'Tạo tài khoản người dùng thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo tài khoản', 500);
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return sendError(res, 'Không tìm thấy tài khoản', 404);

    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return sendSuccess(
      res,
      updated,
      newStatus === 'LOCKED' ? 'Đã khóa tài khoản người dùng thành công' : 'Đã mở khóa tài khoản người dùng thành công'
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi thay đổi trạng thái', 500);
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 'Mật khẩu mới phải từ 6 ký tự trở lên', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, null, 'Đặt lại mật khẩu tài khoản thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi đặt lại mật khẩu', 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendError(res, 'ID tài khoản không hợp lệ', 400);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!user) return sendError(res, 'Không tìm thấy tài khoản', 404);

    const ops: any[] = [
      prisma.notification.deleteMany({ where: { userId: id } }),
    ];

    if (user.patient) {
      const pId = user.patient.id;
      ops.push(
        prisma.appointment.deleteMany({ where: { patientId: pId } }),
        prisma.medicalRecord.deleteMany({ where: { patientId: pId } }),
        prisma.treatment.deleteMany({ where: { patientId: pId } }),
        prisma.invoice.deleteMany({ where: { patientId: pId } }),
        prisma.patient.delete({ where: { id: pId } })
      );
    }

    ops.push(prisma.user.delete({ where: { id } }));

    await prisma.$transaction(ops);

    return sendSuccess(res, null, 'Xóa tài khoản người dùng thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa tài khoản', 500);
  }
};

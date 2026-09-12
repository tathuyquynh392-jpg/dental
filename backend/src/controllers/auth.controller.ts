import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { generateToken } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, dateOfBirth, gender, address, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !dateOfBirth || !gender || !address || !password) {
      return sendError(res, 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 400);
    }

    if (password !== confirmPassword) {
      return sendError(res, 'Mật khẩu xác nhận không trùng khớp', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400);
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email này đã được đăng ký trong hệ thống', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'PATIENT',
        status: 'ACTIVE',
        patient: {
          create: {
            dateOfBirth,
            gender,
            address,
            medicalHistory: '',
            allergy: '',
            notes: '',
          },
        },
      },
      include: { patient: true },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patient?.id,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          patientId: user.patient?.id,
        },
      },
      'Đăng ký tài khoản thành công!',
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi đăng ký tài khoản', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Vui lòng nhập Email và Mật khẩu', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { patient: true },
    });

    if (!user) {
      return sendError(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    if (user.status === 'LOCKED') {
      return sendError(res, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ phòng khám.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patient?.id,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          patientId: user.patient?.id,
        },
      },
      'Đăng nhập thành công!'
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi đăng nhập', 500);
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa xác thực', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      return sendError(res, 'Không tìm thấy người dùng', 44);
    }

    return sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

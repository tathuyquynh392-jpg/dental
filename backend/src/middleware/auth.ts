import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import { sendError } from '../utils/response';
import { prisma } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Vui lòng đăng nhập để thực hiện thao tác này', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Check if user is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { patient: true }
    });

    if (!user) {
      return sendError(res, 'Tài khoản không tồn tại', 401);
    }

    if (user.status === 'LOCKED') {
      return sendError(res, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patient?.id
    };

    next();
  } catch (error) {
    return sendError(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Bạn không có quyền truy cập chức năng dành cho Admin', 403);
  }
  next();
};

export const requirePatient = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'PATIENT') {
    return sendError(res, 'Bạn không có quyền thực hiện thao tác của bệnh nhân', 403);
  }
  next();
};

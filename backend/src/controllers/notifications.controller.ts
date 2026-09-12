import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getNotifications = async (req: any, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Chưa xác thực', 401);

    const where: any = {};
    if (req.user.role === 'PATIENT') {
      where.userId = req.user.userId;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead && n.userId === req.user?.userId).length;

    return sendSuccess(res, notifications, 'Danh sách thông báo', 200, { unreadCount });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy thông báo', 500);
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, targetRole } = req.body;

    if (!title || !message) {
      return sendError(res, 'Vui lòng nhập tiêu đề và nội dung thông báo', 400);
    }

    if (targetRole === 'ALL_PATIENTS') {
      const patients = await prisma.user.findMany({ where: { role: 'PATIENT' } });
      const notifs = patients.map((p) => ({
        userId: p.id,
        title,
        message,
        isRead: false,
      }));
      await prisma.notification.createMany({ data: notifs });
      return sendSuccess(res, null, `Đã gửi thông báo đến ${patients.length} bệnh nhân`, 201);
    }

    if (!userId) {
      return sendError(res, 'Vui lòng chọn người nhận thông báo', 400);
    }

    const notif = await prisma.notification.create({
      data: {
        userId: parseInt(userId, 10),
        title,
        message,
        isRead: false,
      },
    });

    return sendSuccess(res, notif, 'Tạo thông báo thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo thông báo', 500);
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return sendSuccess(res, updated, 'Đã đánh dấu đã đọc');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật thông báo', 500);
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Chưa xác thực', 401);

    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });

    return sendSuccess(res, null, 'Đã đánh dấu tất cả là đã đọc');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật tất cả thông báo', 500);
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.notification.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa thông báo thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa thông báo', 500);
  }
};

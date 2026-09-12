import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAppointments = async (req: any, res: Response) => {
  try {
    const { search, status, date, doctorId, patientId, sort = 'appointmentDate', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Patient Scope Enforcement
    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'Danh sách lịch hẹn', 200, { total: 0, page: 1, limit: limitNum, totalPages: 0 });
      }
      where.patientId = req.user.patientId;
    } else if (patientId) {
      where.patientId = parseInt(patientId as string, 10);
    }

    if (doctorId && doctorId !== 'ALL') {
      where.doctorId = parseInt(doctorId as string, 10);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (date) {
      where.appointmentDate = String(date);
    }

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { patient: { user: { name: { contains: searchStr } } } },
        { doctor: { name: { contains: searchStr } } },
        { service: { name: { contains: searchStr } } },
        { notes: { contains: searchStr } },
      ];
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: {
          patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
          doctor: true,
          service: true,
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, appointments, 'Danh sách lịch hẹn', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách lịch hẹn', 500);
  }
};

export const getAppointmentById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        service: true,
        medicalRecords: true,
        invoices: true,
      },
    });

    if (!appointment) return sendError(res, 'Không tìm thấy lịch hẹn', 404);

    if (req.user?.role === 'PATIENT' && appointment.patientId !== req.user.patientId) {
      return sendError(res, 'Bạn không có quyền truy cập lịch hẹn của người khác', 403);
    }

    return sendSuccess(res, appointment, 'Chi tiết lịch hẹn');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createAppointment = async (req: any, res: Response) => {
  try {
    let { patientId, doctorId, serviceId, appointmentDate, appointmentTime, notes } = req.body;

    // If patient is creating, force patientId to their own ID
    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendError(res, 'Hồ sơ bệnh nhân không tồn tại', 400);
      }
      patientId = req.user.patientId;
    }

    if (!patientId || !doctorId || !serviceId || !appointmentDate || !appointmentTime) {
      return sendError(res, 'Vui lòng chọn đầy đủ Bệnh nhân, Bác sĩ, Dịch vụ, Ngày và Giờ khám', 400);
    }

    const pId = parseInt(patientId, 10);
    const dId = parseInt(doctorId, 10);
    const sId = parseInt(serviceId, 10);

    // Double Booking Validation: Check if doctor already has an active appointment at same date & time
    const existingDoctorBooking = await prisma.appointment.findFirst({
      where: {
        doctorId: dId,
        appointmentDate: String(appointmentDate),
        appointmentTime: String(appointmentTime),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: { doctor: true },
    });

    if (existingDoctorBooking) {
      return sendError(
        res,
        `Bác sĩ ${existingDoctorBooking.doctor.name} đã có lịch hẹn khác vào khung giờ ${appointmentTime} ngày ${appointmentDate}. Vui lòng chọn khung giờ hoặc bác sĩ khác.`,
        409
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: pId,
        doctorId: dId,
        serviceId: sId,
        appointmentDate: String(appointmentDate),
        appointmentTime: String(appointmentTime),
        notes: notes || '',
        status: 'PENDING',
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        service: true,
      },
    });

    // Create notification for Admin & Patient
    if (req.user?.role === 'PATIENT') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Lịch hẹn mới đăng ký',
            message: `Bệnh nhân ${appointment.patient.user.name} vừa đặt lịch hẹn mới vào ngày ${appointmentDate} lúc ${appointmentTime}.`,
          },
        });
      }
    }

    return sendSuccess(res, appointment, 'Đặt lịch hẹn thành công. Vui lòng chờ phòng khám xác nhận.', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi đặt lịch hẹn', 500);
  }
};

export const updateAppointment = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { doctorId, serviceId, appointmentDate, appointmentTime, notes, status } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!appointment) return sendError(res, 'Không tìm thấy lịch hẹn', 404);

    // Patient restriction
    if (req.user?.role === 'PATIENT') {
      if (appointment.patientId !== req.user.patientId) {
        return sendError(res, 'Bạn không có quyền chỉnh sửa lịch hẹn này', 403);
      }
      // Patients can only cancel their pending or confirmed appointment
      if (status && status !== 'CANCELLED') {
        return sendError(res, 'Bệnh nhân chỉ có quyền hủy lịch hẹn', 403);
      }
    }

    // Check double booking if doctor/date/time is updated
    const targetDoctorId = doctorId ? parseInt(doctorId, 10) : appointment.doctorId;
    const targetDate = appointmentDate ? String(appointmentDate) : appointment.appointmentDate;
    const targetTime = appointmentTime ? String(appointmentTime) : appointment.appointmentTime;

    if (doctorId || appointmentDate || appointmentTime) {
      const existingConflict = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: targetDoctorId,
          appointmentDate: targetDate,
          appointmentTime: targetTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingConflict) {
        return sendError(res, `Bác sĩ đã có lịch hẹn khác trùng khung giờ ${targetTime} ngày ${targetDate}`, 409);
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        doctorId: targetDoctorId,
        serviceId: serviceId ? parseInt(serviceId, 10) : appointment.serviceId,
        appointmentDate: targetDate,
        appointmentTime: targetTime,
        notes: notes ?? appointment.notes,
        status: status ?? appointment.status,
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        service: true,
      },
    });

    // Notify Patient on status change by Admin
    if (req.user?.role === 'ADMIN' && status && status !== appointment.status) {
      const statusTextMap: Record<string, string> = {
        CONFIRMED: 'ĐÃ XÁC NHẬN',
        COMPLETED: 'ĐÃ HOÀN THÀNH',
        CANCELLED: 'ĐÃ HỦY',
        NO_SHOW: 'VẮNG MẶT',
      };
      const text = statusTextMap[status] || status;
      await prisma.notification.create({
        data: {
          userId: updatedAppointment.patient.userId,
          title: `Cập nhật trạng thái lịch hẹn`,
          message: `Lịch hẹn khám ngày ${updatedAppointment.appointmentDate} lúc ${updatedAppointment.appointmentTime} của bạn đã chuyển sang trạng thái: ${text}.`,
        },
      });
    }

    return sendSuccess(res, updatedAppointment, 'Cập nhật lịch hẹn thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật lịch hẹn', 500);
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.appointment.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa lịch hẹn thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa lịch hẹn', 500);
  }
};

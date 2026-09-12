import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTreatments = async (req: any, res: Response) => {
  try {
    const { search, status, patientId, doctorId, sort = 'startDate', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'Quá trình điều trị', 200, { total: 0, page: 1, limit: limitNum, totalPages: 0 });
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

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { patient: { user: { name: { contains: searchStr } } } },
        { doctor: { name: { contains: searchStr } } },
        { service: { name: { contains: searchStr } } },
        { notes: { contains: searchStr } },
      ];
    }

    const [total, treatments] = await Promise.all([
      prisma.treatment.count({ where }),
      prisma.treatment.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          doctor: true,
          service: true,
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, treatments, 'Danh sách đợt điều trị', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách điều trị', 500);
  }
};

export const getTreatmentById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        service: true,
      },
    });

    if (!treatment) return sendError(res, 'Không tìm thấy thông tin điều trị', 404);

    if (req.user?.role === 'PATIENT' && treatment.patientId !== req.user.patientId) {
      return sendError(res, 'Bạn không có quyền xem điều trị của bệnh nhân khác', 403);
    }

    return sendSuccess(res, treatment, 'Chi tiết điều trị');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, serviceId, startDate, endDate, cost, status, notes } = req.body;

    if (!patientId || !doctorId || !serviceId || !startDate || cost === undefined) {
      return sendError(res, 'Vui lòng nhập đầy đủ Bệnh nhân, Bác sĩ, Dịch vụ, Ngày bắt đầu và Chi phí', 400);
    }

    const treatment = await prisma.treatment.create({
      data: {
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctorId, 10),
        serviceId: parseInt(serviceId, 10),
        startDate: String(startDate),
        endDate: endDate ? String(endDate) : '',
        cost: parseFloat(cost),
        status: status || 'IN_PROGRESS',
        notes: notes || '',
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        service: true,
      },
    });

    return sendSuccess(res, treatment, 'Tạo đợt điều trị mới thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo ca điều trị', 500);
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { doctorId, serviceId, startDate, endDate, cost, status, notes } = req.body;

    const treatment = await prisma.treatment.findUnique({ where: { id } });
    if (!treatment) return sendError(res, 'Không tìm thấy thông tin điều trị', 404);

    const updated = await prisma.treatment.update({
      where: { id },
      data: {
        doctorId: doctorId ? parseInt(doctorId, 10) : treatment.doctorId,
        serviceId: serviceId ? parseInt(serviceId, 10) : treatment.serviceId,
        startDate: startDate ? String(startDate) : treatment.startDate,
        endDate: endDate !== undefined ? String(endDate) : treatment.endDate,
        cost: cost !== undefined ? parseFloat(cost) : treatment.cost,
        status: status ?? treatment.status,
        notes: notes ?? treatment.notes,
      },
      include: { patient: { include: { user: true } }, doctor: true, service: true },
    });

    return sendSuccess(res, updated, 'Cập nhật ca điều trị thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật điều trị', 500);
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.treatment.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa ca điều trị thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa điều trị', 500);
  }
};

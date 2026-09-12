import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMedicalRecords = async (req: any, res: Response) => {
  try {
    const { search, patientId, doctorId, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'Hồ sơ khám bệnh', 200, { total: 0, page: 1, limit: limitNum, totalPages: 0 });
      }
      where.patientId = req.user.patientId;
    } else if (patientId) {
      where.patientId = parseInt(patientId as string, 10);
    }

    if (doctorId && doctorId !== 'ALL') {
      where.doctorId = parseInt(doctorId as string, 10);
    }

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { patient: { user: { name: { contains: searchStr } } } },
        { doctor: { name: { contains: searchStr } } },
        { diagnosis: { contains: searchStr } },
        { symptoms: { contains: searchStr } },
        { treatment: { contains: searchStr } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.medicalRecord.count({ where }),
      prisma.medicalRecord.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          doctor: true,
          appointment: { include: { service: true } },
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, records, 'Danh sách hồ sơ khám bệnh', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy hồ sơ khám', 500);
  }
};

export const getMedicalRecordById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: true,
        appointment: { include: { service: true } },
      },
    });

    if (!record) return sendError(res, 'Không tìm thấy hồ sơ khám', 404);

    if (req.user?.role === 'PATIENT' && record.patientId !== req.user.patientId) {
      return sendError(res, 'Bạn không có quyền truy cập hồ sơ bệnh án này', 403);
    }

    return sendSuccess(res, record, 'Chi tiết hồ sơ khám');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, appointmentId, symptoms, diagnosis, dentalCondition, treatment, notes, prescription, followUpDate } = req.body;

    if (!patientId || !doctorId || !symptoms || !diagnosis || !treatment) {
      return sendError(res, 'Vui lòng nhập đầy đủ Bệnh nhân, Bác sĩ, Triệu chứng, Chẩn đoán và Điều trị', 400);
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctorId, 10),
        appointmentId: appointmentId ? parseInt(appointmentId, 10) : undefined,
        symptoms,
        diagnosis,
        dentalCondition: dentalCondition || '',
        treatment,
        notes: notes || '',
        prescription: prescription || '',
        followUpDate: followUpDate || '',
      },
      include: {
        patient: { include: { user: true } },
        doctor: true,
      },
    });

    // Automatically update appointment status to COMPLETED if linked
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: parseInt(appointmentId, 10) },
        data: { status: 'COMPLETED' },
      });
    }

    return sendSuccess(res, record, 'Tạo hồ sơ khám bệnh thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo hồ sơ khám', 500);
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { doctorId, symptoms, diagnosis, dentalCondition, treatment, notes, prescription, followUpDate } = req.body;

    const record = await prisma.medicalRecord.findUnique({ where: { id } });
    if (!record) return sendError(res, 'Không tìm thấy hồ sơ khám', 404);

    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: {
        doctorId: doctorId ? parseInt(doctorId, 10) : record.doctorId,
        symptoms: symptoms ?? record.symptoms,
        diagnosis: diagnosis ?? record.diagnosis,
        dentalCondition: dentalCondition ?? record.dentalCondition,
        treatment: treatment ?? record.treatment,
        notes: notes ?? record.notes,
        prescription: prescription ?? record.prescription,
        followUpDate: followUpDate ?? record.followUpDate,
      },
      include: { patient: { include: { user: true } }, doctor: true },
    });

    return sendSuccess(res, updated, 'Cập nhật hồ sơ khám thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật hồ sơ khám', 500);
  }
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.medicalRecord.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa hồ sơ khám thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa hồ sơ khám', 500);
  }
};

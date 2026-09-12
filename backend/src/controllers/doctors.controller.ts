import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { search, status, specialty, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

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
        { specialty: { contains: searchStr } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (specialty && specialty !== 'ALL') {
      where.specialty = { contains: String(specialty) };
    }

    const [total, doctors] = await Promise.all([
      prisma.doctor.count({ where }),
      prisma.doctor.findMany({
        where,
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, doctors, 'Danh sách bác sĩ', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách bác sĩ', 500);
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: { include: { patient: { include: { user: true } }, service: true } },
        medicalRecords: { include: { patient: { include: { user: true } } } },
        treatments: { include: { patient: { include: { user: true } }, service: true } },
      },
    });

    if (!doctor) return sendError(res, 'Không tìm thấy bác sĩ', 404);
    return sendSuccess(res, doctor, 'Chi tiết bác sĩ');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, specialty, qualification, experience, workingDays, workingHours, status } = req.body;

    if (!name || !email || !phone || !specialty || !qualification || !workingDays || !workingHours) {
      return sendError(res, 'Vui lòng nhập đầy đủ thông tin bác sĩ bắt buộc (*)', 400);
    }

    const existingDoctor = await prisma.doctor.findUnique({ where: { email } });
    if (existingDoctor) {
      return sendError(res, 'Email bác sĩ này đã tồn tại trong hệ thống', 409);
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        phone,
        specialty,
        qualification,
        experience: experience || 'Nhiều năm kinh nghiệm',
        workingDays,
        workingHours,
        status: status || 'ACTIVE',
      },
    });

    return sendSuccess(res, doctor, 'Tạo bác sĩ mới thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo bác sĩ', 500);
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, phone, specialty, qualification, experience, workingDays, workingHours, status } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return sendError(res, 'Không tìm thấy bác sĩ', 404);

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: name ?? doctor.name,
        email: email ?? doctor.email,
        phone: phone ?? doctor.phone,
        specialty: specialty ?? doctor.specialty,
        qualification: qualification ?? doctor.qualification,
        experience: experience ?? doctor.experience,
        workingDays: workingDays ?? doctor.workingDays,
        workingHours: workingHours ?? doctor.workingHours,
        status: status ?? doctor.status,
      },
    });

    return sendSuccess(res, updatedDoctor, 'Cập nhật thông tin bác sĩ thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật bác sĩ', 500);
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.doctor.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa bác sĩ thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa bác sĩ', 500);
  }
};

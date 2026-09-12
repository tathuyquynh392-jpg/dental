import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export const getServices = async (req: Request, res: Response) => {
  try {
    const { search, status, sort = 'createdAt', order = 'desc', page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { description: { contains: searchStr } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, services, 'Danh sách dịch vụ nha khoa', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách dịch vụ', 500);
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return sendError(res, 'Không tìm thấy dịch vụ', 404);
    return sendSuccess(res, service, 'Chi tiết dịch vụ');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, status } = req.body;

    if (!name || price === undefined || !duration) {
      return sendError(res, 'Vui lòng nhập tên dịch vụ, giá tiền và thời gian thực hiện', 400);
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        status: status || 'ACTIVE',
      },
    });

    return sendSuccess(res, service, 'Thêm dịch vụ mới thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi thêm dịch vụ', 500);
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, duration, status } = req.body;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return sendError(res, 'Không tìm thấy dịch vụ', 404);

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: name ?? service.name,
        description: description ?? service.description,
        price: price !== undefined ? parseFloat(price) : service.price,
        duration: duration !== undefined ? parseInt(duration, 10) : service.duration,
        status: status ?? service.status,
      },
    });

    return sendSuccess(res, updatedService, 'Cập nhật dịch vụ thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật dịch vụ', 500);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.service.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa dịch vụ thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa dịch vụ', 500);
  }
};

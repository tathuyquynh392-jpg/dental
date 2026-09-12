import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export const getMedications = async (req: Request, res: Response) => {
  try {
    const { search, category, status, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { category: { contains: searchStr } },
        { supplier: { contains: searchStr } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = String(category);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const [total, medications] = await Promise.all([
      prisma.medication.count({ where }),
      prisma.medication.findMany({
        where,
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    // Calculate stock alerts summary
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [lowStockCount, outOfStockCount, nearExpiryCount] = await Promise.all([
      prisma.medication.count({ where: { quantity: { gt: 0, lte: 10 } } }),
      prisma.medication.count({ where: { quantity: 0 } }),
      prisma.medication.count({ where: { expiryDate: { lte: thirtyDaysLater } } }),
    ]);

    return sendSuccess(res, medications, 'Danh sách thuốc', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      warnings: {
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        nearExpiry: nearExpiryCount,
      },
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách thuốc', 500);
  }
};

export const getMedicationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const medication = await prisma.medication.findUnique({ where: { id } });
    if (!medication) return sendError(res, 'Không tìm thấy thông tin thuốc', 404);
    return sendSuccess(res, medication, 'Chi tiết thuốc');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    const { name, category, unit, quantity, price, expiryDate, supplier } = req.body;

    if (!name || !category || !unit || quantity === undefined || price === undefined || !expiryDate || !supplier) {
      return sendError(res, 'Vui lòng nhập đầy đủ Tên thuốc, Loại, Đơn vị, Số lượng, Giá, Hạn sử dụng và Nhà cung cấp', 400);
    }

    const qty = parseInt(quantity, 10);
    let computedStatus = 'AVAILABLE';
    if (qty === 0) computedStatus = 'OUT_OF_STOCK';
    else if (qty <= 10) computedStatus = 'LOW_STOCK';

    const medication = await prisma.medication.create({
      data: {
        name,
        category,
        unit,
        quantity: qty,
        price: parseFloat(price),
        expiryDate: String(expiryDate),
        supplier,
        status: computedStatus,
      },
    });

    return sendSuccess(res, medication, 'Thêm thuốc mới vào kho thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi thêm thuốc', 500);
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, unit, quantity, price, expiryDate, supplier, status } = req.body;

    const medication = await prisma.medication.findUnique({ where: { id } });
    if (!medication) return sendError(res, 'Không tìm thấy thuốc', 404);

    const qty = quantity !== undefined ? parseInt(quantity, 10) : medication.quantity;
    let computedStatus = status ?? medication.status;
    if (qty === 0) computedStatus = 'OUT_OF_STOCK';
    else if (qty <= 10 && computedStatus === 'AVAILABLE') computedStatus = 'LOW_STOCK';
    else if (qty > 10 && computedStatus === 'LOW_STOCK') computedStatus = 'AVAILABLE';

    const updated = await prisma.medication.update({
      where: { id },
      data: {
        name: name ?? medication.name,
        category: category ?? medication.category,
        unit: unit ?? medication.unit,
        quantity: qty,
        price: price !== undefined ? parseFloat(price) : medication.price,
        expiryDate: expiryDate ? String(expiryDate) : medication.expiryDate,
        supplier: supplier ?? medication.supplier,
        status: computedStatus,
      },
    });

    return sendSuccess(res, updated, 'Cập nhật thông tin thuốc thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật thuốc', 500);
  }
};

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.medication.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa thuốc thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa thuốc', 500);
  }
};

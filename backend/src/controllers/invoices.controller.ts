import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getInvoices = async (req: any, res: Response) => {
  try {
    const { search, status, patientId, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'Hóa đơn thanh toán', 200, { total: 0, page: 1, limit: limitNum, totalPages: 0 });
      }
      where.patientId = req.user.patientId;
    } else if (patientId) {
      where.patientId = parseInt(patientId as string, 10);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { invoiceCode: { contains: searchStr } },
        { patient: { user: { name: { contains: searchStr } } } },
      ];
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          appointment: { include: { service: true } },
          items: { include: { service: true } },
          payments: true,
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, invoices, 'Danh sách hóa đơn', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách hóa đơn', 500);
  }
};

export const getInvoiceById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        appointment: { include: { doctor: true, service: true } },
        items: { include: { service: true } },
        payments: true,
      },
    });

    if (!invoice) return sendError(res, 'Không tìm thấy hóa đơn', 404);

    if (req.user?.role === 'PATIENT' && invoice.patientId !== req.user.patientId) {
      return sendError(res, 'Bạn không có quyền xem hóa đơn của bệnh nhân khác', 403);
    }

    return sendSuccess(res, invoice, 'Chi tiết hóa đơn');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { patientId, appointmentId, invoiceDate, discount = 0, items } = req.body;

    if (!patientId || !invoiceDate || !items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Vui lòng chọn Bệnh nhân, Ngày lập và ít nhất 1 dịch vụ thanh toán', 400);
    }

    let subtotal = 0;
    const formattedItems = items.map((item: any) => {
      const qty = parseInt(item.quantity || 1, 10);
      const price = parseFloat(item.unitPrice || 0);
      const itemAmount = qty * price;
      subtotal += itemAmount;

      return {
        serviceId: item.serviceId ? parseInt(item.serviceId, 10) : undefined,
        description: item.description || 'Dịch vụ nha khoa',
        quantity: qty,
        unitPrice: price,
        amount: itemAmount,
      };
    });

    const disc = parseFloat(discount || 0);
    const total = Math.max(0, subtotal - disc);
    const randomCode = `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceCode: randomCode,
        patientId: parseInt(patientId, 10),
        appointmentId: appointmentId ? parseInt(appointmentId, 10) : undefined,
        invoiceDate: String(invoiceDate),
        subtotal,
        discount: disc,
        total,
        paidAmount: 0,
        status: 'UNPAID',
        items: {
          create: formattedItems,
        },
      },
      include: {
        patient: { include: { user: true } },
        items: true,
      },
    });

    return sendSuccess(res, invoice, 'Tạo hóa đơn thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo hóa đơn', 500);
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { discount, status } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return sendError(res, 'Không tìm thấy hóa đơn', 404);

    const disc = discount !== undefined ? parseFloat(discount) : invoice.discount;
    const total = Math.max(0, invoice.subtotal - disc);

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        discount: disc,
        total,
        status: status ?? invoice.status,
      },
      include: { patient: { include: { user: true } }, items: true, payments: true },
    });

    return sendSuccess(res, updated, 'Cập nhật hóa đơn thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi cập nhật hóa đơn', 500);
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.invoice.delete({ where: { id } });
    return sendSuccess(res, null, 'Xóa hóa đơn thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa hóa đơn', 500);
  }
};

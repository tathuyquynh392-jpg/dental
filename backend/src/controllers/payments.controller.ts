import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getPayments = async (req: any, res: Response) => {
  try {
    const { search, paymentMethod, invoiceId, sort = 'createdAt', order = 'desc', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return sendSuccess(res, [], 'Lịch sử thanh toán', 200, { total: 0, page: 1, limit: limitNum, totalPages: 0 });
      }
      where.invoice = { patientId: req.user.patientId };
    }

    if (invoiceId) {
      where.invoiceId = parseInt(invoiceId as string, 10);
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = String(paymentMethod);
    }

    if (search) {
      const searchStr = String(search).trim();
      where.OR = [
        { paymentCode: { contains: searchStr } },
        { invoice: { invoiceCode: { contains: searchStr } } },
        { invoice: { patient: { user: { name: { contains: searchStr } } } } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: {
          invoice: { include: { patient: { include: { user: true } } } },
        },
        orderBy: { [sort as string]: order === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, payments, 'Danh sách thanh toán', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy danh sách thanh toán', 500);
  }
};

export const getPaymentById = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: { include: { patient: { include: { user: true } }, items: true } } },
    });

    if (!payment) return sendError(res, 'Không tìm thấy thanh toán', 404);

    if (req.user?.role === 'PATIENT' && payment.invoice.patientId !== req.user.patientId) {
      return sendError(res, 'Bạn không có quyền xem thanh toán này', 403);
    }

    return sendSuccess(res, payment, 'Chi tiết thanh toán');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi server', 500);
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, paymentDate, note } = req.body;

    if (!invoiceId || !amount || !paymentMethod || !paymentDate) {
      return sendError(res, 'Vui lòng chọn Hóa đơn, Số tiền, Phương thức và Ngày thanh toán', 400);
    }

    const invId = parseInt(invoiceId, 10);
    const payAmount = parseFloat(amount);

    const invoice = await prisma.invoice.findUnique({ where: { id: invId } });
    if (!invoice) return sendError(res, 'Hóa đơn không tồn tại', 404);

    const randomCode = `TT-${new Date().getFullYear()}-${Math.floor(5000 + Math.random() * 5000)}`;

    const payment = await prisma.payment.create({
      data: {
        paymentCode: randomCode,
        invoiceId: invId,
        amount: payAmount,
        paymentMethod: String(paymentMethod),
        paymentDate: String(paymentDate),
        status: 'COMPLETED',
        note: note || '',
      },
      include: { invoice: { include: { patient: { include: { user: true } } } } },
    });

    // Recalculate total paid for invoice
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: invId, status: 'COMPLETED' },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus = 'UNPAID';
    if (totalPaid >= invoice.total) newStatus = 'PAID';
    else if (totalPaid > 0) newStatus = 'PARTIAL';

    await prisma.invoice.update({
      where: { id: invId },
      data: {
        paidAmount: totalPaid,
        status: newStatus,
      },
    });

    return sendSuccess(res, payment, 'Tạo giao dịch thanh toán thành công', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tạo thanh toán', 500);
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) return sendError(res, 'Không tìm thấy thanh toán', 404);

    const invId = payment.invoiceId;
    await prisma.payment.delete({ where: { id } });

    // Recalculate invoice paid amount
    const invoice = await prisma.invoice.findUnique({ where: { id: invId } });
    if (invoice) {
      const remainingPayments = await prisma.payment.findMany({
        where: { invoiceId: invId, status: 'COMPLETED' },
      });
      const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);

      let newStatus = 'UNPAID';
      if (totalPaid >= invoice.total) newStatus = 'PAID';
      else if (totalPaid > 0) newStatus = 'PARTIAL';

      await prisma.invoice.update({
        where: { id: invId },
        data: { paidAmount: totalPaid, status: newStatus },
      });
    }

    return sendSuccess(res, null, 'Xóa lịch sử thanh toán thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi xóa thanh toán', 500);
  }
};

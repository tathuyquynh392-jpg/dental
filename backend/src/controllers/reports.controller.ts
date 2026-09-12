import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export const getReportsData = async (req: Request, res: Response) => {
  try {
    const { timeRange = 'this_month', startDate, endDate } = req.query;

    const now = new Date();
    let filterStartDate = '';
    let filterEndDate = '';

    if (timeRange === 'today') {
      filterStartDate = now.toISOString().split('T')[0];
      filterEndDate = filterStartDate;
    } else if (timeRange === 'this_week') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      filterStartDate = firstDay.toISOString().split('T')[0];
      filterEndDate = new Date().toISOString().split('T')[0];
    } else if (timeRange === 'this_month') {
      filterStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      filterEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
    } else if (timeRange === 'this_year') {
      filterStartDate = `${now.getFullYear()}-01-01`;
      filterEndDate = `${now.getFullYear()}-12-31`;
    } else if (timeRange === 'custom' && startDate && endDate) {
      filterStartDate = String(startDate);
      filterEndDate = String(endDate);
    }

    const invoiceWhere: any = {};
    const appointmentWhere: any = {};

    if (filterStartDate && filterEndDate) {
      invoiceWhere.invoiceDate = { gte: filterStartDate, lte: filterEndDate };
      appointmentWhere.appointmentDate = { gte: filterStartDate, lte: filterEndDate };
    }

    const [invoices, appointments, totalPatients, totalDoctors, popularServicesData] = await Promise.all([
      prisma.invoice.findMany({
        where: invoiceWhere,
        include: { items: { include: { service: true } } },
      }),
      prisma.appointment.findMany({
        where: appointmentWhere,
        include: { doctor: true, service: true },
      }),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.invoiceItem.groupBy({
        by: ['serviceId'],
        _sum: { quantity: true, amount: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED').length;
    const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : '0';

    // Doctor performance
    const doctorPerfMap: Record<string, { doctorName: string; appointmentCount: number; completedCount: number }> = {};
    appointments.forEach((app) => {
      const docName = app.doctor.name;
      if (!doctorPerfMap[docName]) {
        doctorPerfMap[docName] = { doctorName: docName, appointmentCount: 0, completedCount: 0 };
      }
      doctorPerfMap[docName].appointmentCount += 1;
      if (app.status === 'COMPLETED') doctorPerfMap[docName].completedCount += 1;
    });

    return sendSuccess(res, {
      summary: {
        totalRevenue,
        totalInvoiced,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate: `${completionRate}%`,
        totalPatients,
        totalDoctors,
      },
      doctorPerformance: Object.values(doctorPerfMap),
      timeFilter: { timeRange, startDate: filterStartDate, endDate: filterEndDate },
    }, 'Báo cáo tổng hợp thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy báo cáo', 500);
  }
};

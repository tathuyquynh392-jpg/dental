import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminDashboardStats = async (req: any, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

    // 1. Stats Cards
    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      activeTreatments,
      monthlyInvoices,
      recentAppointments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count({ where: { status: 'ACTIVE' } }),
      prisma.appointment.count({ where: { appointmentDate: todayStr } }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.treatment.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.invoice.findMany({
        where: { invoiceDate: { startsWith: currentMonthPrefix } },
        select: { total: true, paidAmount: true },
      }),
      prisma.appointment.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { name: true, phone: true } } } },
          doctor: { select: { name: true } },
          service: { select: { name: true } },
        },
      }),
    ]);

    const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    // 2. Appointment status distribution
    const appointmentStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const appointmentStatusCounts = await Promise.all(
      appointmentStatuses.map(async (status) => {
        const count = await prisma.appointment.count({ where: { status } });
        return { status, count };
      })
    );

    // 3. Revenue by month / day sample (for chart)
    const allInvoices = await prisma.invoice.findMany({
      select: { invoiceDate: true, paidAmount: true },
    });

    const revenueByMonthMap: Record<string, number> = {};
    allInvoices.forEach((inv) => {
      const month = inv.invoiceDate.substring(0, 7);
      revenueByMonthMap[month] = (revenueByMonthMap[month] || 0) + inv.paidAmount;
    });

    const revenueChartData = Object.keys(revenueByMonthMap)
      .sort()
      .map((month) => ({
        label: `Tháng ${month.substring(5)}`,
        revenue: revenueByMonthMap[month],
      }));

    // 4. Popular services
    const invoiceItems = await prisma.invoiceItem.findMany({
      include: { service: true },
    });

    const serviceUsageMap: Record<string, { name: string; count: number; totalRevenue: number }> = {};
    invoiceItems.forEach((item) => {
      const sName = item.service?.name || item.description;
      if (!serviceUsageMap[sName]) {
        serviceUsageMap[sName] = { name: sName, count: 0, totalRevenue: 0 };
      }
      serviceUsageMap[sName].count += item.quantity;
      serviceUsageMap[sName].totalRevenue += item.amount;
    });

    const popularServices = Object.values(serviceUsageMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. Patient Growth sample
    const patientGrowthData = [
      { period: 'T5', count: 2 },
      { period: 'T6', count: 4 },
      { period: 'T7', count: 6 },
      { period: 'T8', count: 8 },
      { period: 'T9', count: 10 },
    ];

    return sendSuccess(res, {
      cards: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        pendingAppointments,
        activeTreatments,
        monthlyRevenue,
      },
      charts: {
        revenue: revenueChartData,
        appointmentStatus: appointmentStatusCounts,
        patientGrowth: patientGrowthData,
        popularServices,
      },
      recentAppointments,
    }, 'Thống kê dashboard thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi lấy thống kê dashboard', 500);
  }
};

export const getPatientDashboardStats = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.patientId) {
      return sendError(res, 'Không tìm thấy hồ sơ bệnh nhân', 400);
    }

    const patientId = req.user.patientId;
    const todayStr = new Date().toISOString().split('T')[0];

    const [upcomingAppointment, lastVisit, activeTreatment, totalVisits, unpaidInvoices] = await Promise.all([
      prisma.appointment.findFirst({
        where: { patientId, appointmentDate: { gte: todayStr }, status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { doctor: true, service: true },
        orderBy: { appointmentDate: 'asc' },
      }),
      prisma.medicalRecord.findFirst({
        where: { patientId },
        include: { doctor: true, appointment: { include: { service: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.treatment.findFirst({
        where: { patientId, status: 'IN_PROGRESS' },
        include: { doctor: true, service: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.count({
        where: { patientId, status: 'COMPLETED' },
      }),
      prisma.invoice.findMany({
        where: { patientId, status: { in: ['UNPAID', 'PARTIAL'] } },
        include: { items: true },
      }),
    ]);

    const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

    return sendSuccess(res, {
      upcomingAppointment,
      lastVisit,
      activeTreatment,
      totalVisits,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalUnpaidAmount,
    }, 'Thống kê portal bệnh nhân thành công');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi dashboard bệnh nhân', 500);
  }
};

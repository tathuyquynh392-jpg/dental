import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Sparkles,
  Receipt,
  FileText,
  Activity,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientStats();
  }, []);

  const fetchPatientStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/patient');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const upcoming = stats?.upcomingAppointment;
  const lastVisit = stats?.lastVisit;
  const activeTreatment = stats?.activeTreatment;
  const unpaidCount = stats?.unpaidInvoicesCount || 0;
  const unpaidAmount = stats?.totalUnpaidAmount || 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-dental-600 via-dental-500 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-dental-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5" /> Portal Bệnh Nhân Lucky Dental
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-dental-50 font-medium">
            Theo dõi lịch hẹn, hồ sơ bệnh án và hành trình chăm sóc nụ cười rạng rỡ của bạn.
          </p>
        </div>

        <Link
          to="/patient/appointments/create"
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-dental-700 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Đặt lịch khám ngay
        </Link>
      </div>

      {/* Unpaid Warning Card */}
      {unpaidCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-amber-900">
                Bạn có {unpaidCount} hóa đơn chưa thanh toán đầy đủ
              </p>
              <p className="text-amber-700 font-medium">
                Số tiền còn nợ: <strong>{formatVND(unpaidAmount)}</strong>
              </p>
            </div>
          </div>
          <Link
            to="/patient/invoices"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Xem hóa đơn
          </Link>
        </div>
      )}

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-dental-600" />
              Lịch Hẹn Sắp Tới
            </h3>
            {upcoming && <Badge status={upcoming.status} type="appointment" />}
          </div>

          {upcoming ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{upcoming.service?.name}</p>
              <p className="text-slate-600 font-medium flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                Bác sĩ: {upcoming.doctor?.name}
              </p>
              <p className="text-slate-600 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Ngày: <strong className="text-slate-900">{upcoming.appointmentDate}</strong> lúc <strong>{upcoming.appointmentTime}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              Bạn chưa có lịch hẹn sắp tới nào.
            </div>
          )}
        </div>

        {/* Active Treatment */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-dental-600" />
              Điều Trị Đang Thực Hiện
            </h3>
            {activeTreatment && <Badge status={activeTreatment.status} type="treatment" />}
          </div>

          {activeTreatment ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{activeTreatment.service?.name}</p>
              <p className="text-slate-600 font-medium">Bác sĩ: {activeTreatment.doctor?.name}</p>
              <p className="text-slate-500 font-medium">Ngày bắt đầu: {activeTreatment.startDate}</p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              Không có ca điều trị kéo dài nào đang thực hiện.
            </div>
          )}
        </div>

        {/* Quick Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-dental-600" />
            Lần Khám Gần Nhất
          </h3>

          {lastVisit ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{lastVisit.diagnosis}</p>
              <p className="text-slate-600 font-medium">Điều trị: {lastVisit.treatment}</p>
              <p className="text-slate-400 text-[11px]">Ngày khám: {lastVisit.createdAt?.substring(0, 10)}</p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              Chưa có lịch sử khám trước đây.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

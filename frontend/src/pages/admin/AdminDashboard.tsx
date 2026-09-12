import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Clock,
  Activity,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  const cards = data?.cards || {};
  const charts = data?.charts || {};
  const recentAppointments = data?.recentAppointments || [];

  const COLORS = ['#f59e0b', '#38bdf8', '#10b981', '#f43f5e', '#64748b'];

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Quản Trị Hệ Thống</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tổng quan dữ liệu Lucky Dental cập nhật thời gian thực
          </p>
        </div>
        <Link
          to="/admin/appointments"
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <CalendarCheck className="w-4 h-4" />
          Quản lý lịch hẹn
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng bệnh nhân</p>
            <p className="text-2xl font-extrabold text-slate-900">{cards.totalPatients || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng bác sĩ</p>
            <p className="text-2xl font-extrabold text-slate-900">{cards.totalDoctors || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Lịch hẹn hôm nay</p>
            <p className="text-2xl font-extrabold text-slate-900">{cards.todayAppointments || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Lịch chờ duyệt</p>
            <p className="text-2xl font-extrabold text-slate-900">{cards.pendingAppointments || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Ca đang điều trị</p>
            <p className="text-2xl font-extrabold text-slate-900">{cards.activeTreatments || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Doanh thu tháng</p>
            <p className="text-lg font-extrabold text-emerald-600">{formatVND(cards.monthlyRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-dental-600" />
                Biểu đồ Doanh Thu Phòng Khám
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Doanh thu thực tế theo các tháng trong năm</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatVND(value), 'Doanh thu']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Thống Kê Trạng Thái Lịch Hẹn</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">Phân bổ tỷ lệ cuộc hẹn bệnh nhân</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.appointmentStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(charts.appointmentStatus || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Số cuộc hẹn']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold">
            {(charts.appointmentStatus || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{item.status}: <strong>{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Growth & Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Growth */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">Tăng Trưởng Bệnh Nhân Đăng Ký</h3>
          <p className="text-xs text-slate-500 font-medium mb-6">Số lượng bệnh nhân mới qua từng tháng</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.patientGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-dental-500" />
            Top Dịch Vụ Nha Khoa Phổ Biến
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">Những dịch vụ được bệnh nhân đăng ký nhiều nhất</p>
          <div className="space-y-4">
            {(charts.popularServices || []).map((srv: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-dental-100 text-dental-700 font-extrabold text-xs flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{srv.name}</h5>
                    <p className="text-[11px] text-slate-500 font-medium">{srv.count} lượt sử dụng</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">{formatVND(srv.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Lịch Hẹn Gần Đây</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Các cuộc hẹn được đăng ký mới nhất</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-bold text-dental-600 hover:text-dental-700 flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Bệnh nhân</th>
                <th className="py-3.5 px-6">Bác sĩ</th>
                <th className="py-3.5 px-6">Dịch vụ</th>
                <th className="py-3.5 px-6">Ngày & Giờ</th>
                <th className="py-3.5 px-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {recentAppointments.map((app: any) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6">
                    <p className="font-bold text-slate-900">{app.patient?.user?.name || 'N/A'}</p>
                    <p className="text-[11px] text-slate-400">{app.patient?.user?.phone}</p>
                  </td>
                  <td className="py-3.5 px-6 font-semibold">{app.doctor?.name}</td>
                  <td className="py-3.5 px-6">{app.service?.name}</td>
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-slate-800">{app.appointmentDate}</span>
                    <span className="block text-[11px] text-slate-400">{app.appointmentTime}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge status={app.status} type="appointment" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

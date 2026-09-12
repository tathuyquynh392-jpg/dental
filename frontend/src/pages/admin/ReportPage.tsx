import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Stethoscope,
  Filter,
  DollarSign,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = { timeRange };
      if (timeRange === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get('/reports', { params });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchReports();
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const summary = reportData?.summary || {};
  const doctorPerformance = reportData?.doctorPerformance || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Báo Cáo Thống Kê & Hiệu Suất</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Phân tích doanh thu, số lượt khám và hiệu suất bác sĩ</p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'today' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setTimeRange('this_week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'this_week' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setTimeRange('this_month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'this_month' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeRange('this_year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'this_year' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Năm nay
          </button>
          <button
            onClick={() => setTimeRange('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'custom' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tùy chọn
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {timeRange === 'custom' && (
        <form onSubmit={handleCustomFilter} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="px-3 py-1.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs"
          >
            Áp dụng
          </button>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Tổng doanh thu thực tế</p>
                <p className="text-xl font-extrabold text-emerald-600">{formatVND(summary.totalRevenue)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Tổng lượt hẹn</p>
                <p className="text-2xl font-extrabold text-slate-900">{summary.totalAppointments || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-extrabold text-teal-600">{summary.completionRate || '0%'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Tổng bệnh nhân</p>
                <p className="text-2xl font-extrabold text-slate-900">{summary.totalPatients || 0}</p>
              </div>
            </div>
          </div>

          {/* Doctor Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-dental-600" />
              Báo Cáo Hiệu Suất Bác Sĩ
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Tên bác sĩ</th>
                    <th className="py-3.5 px-6">Tổng số cuộc hẹn</th>
                    <th className="py-3.5 px-6">Đã khám hoàn thành</th>
                    <th className="py-3.5 px-6">Tỷ lệ hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {doctorPerformance.map((doc: any, i: number) => {
                    const rate = doc.appointmentCount > 0 ? Math.round((doc.completedCount / doc.appointmentCount) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-extrabold text-slate-900">{doc.doctorName}</td>
                        <td className="py-4 px-6 font-bold">{doc.appointmentCount} cuộc hẹn</td>
                        <td className="py-4 px-6 font-bold text-emerald-600">{doc.completedCount} ca</td>
                        <td className="py-4 px-6 font-extrabold text-dental-600">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

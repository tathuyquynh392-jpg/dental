import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Appointment } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, Clock, Stethoscope, Sparkles, XCircle, PlusCircle } from 'lucide-react';

export const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      setSubmitting(true);
      await api.put(`/appointments/${cancelId}`, { status: 'CANCELLED' });
      showToast('Đã hủy lịch hẹn khám thành công', 'success');
      setCancelId(null);
      fetchAppointments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể hủy lịch hẹn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Danh Sách Lịch Hẹn Của Tôi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Theo dõi lịch hẹn khám và trạng thái xử lý</p>
        </div>
        <Link
          to="/patient/appointments/create"
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Đặt lịch khám mới
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="Bạn chưa đăng ký lịch hẹn nào"
          actionButton={
            <Link
              to="/patient/appointments/create"
              className="px-4 py-2 rounded-xl bg-dental-600 text-white font-bold text-xs"
            >
              Đặt lịch ngay
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Mã lịch: #{a.id}</span>
                  <Badge status={a.status} type="appointment" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{a.service?.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-dental-600" />
                    Bác sĩ: <strong>{a.doctor?.name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-dental-600" />
                    Ngày: <strong>{a.appointmentDate}</strong> lúc <strong>{a.appointmentTime}</strong>
                  </span>
                </div>
                {a.notes && <p className="text-xs text-slate-500 italic">Ghi chú: "{a.notes}"</p>}
              </div>

              {/* Allow Cancel if PENDING or CONFIRMED */}
              {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                <button
                  onClick={() => setCancelId(a.id)}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Hủy lịch hẹn
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Xác nhận hủy lịch hẹn"
        message="Bạn có chắc chắn muốn hủy lịch hẹn khám này không?"
        confirmText="Hủy lịch hẹn"
        loading={submitting}
      />
    </div>
  );
};

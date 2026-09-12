import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Treatment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Activity, Stethoscope, Sparkles, Calendar, DollarSign } from 'lucide-react';

export const PatientTreatments: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/treatments');
      if (res.data.success) {
        setTreatments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Quá Trình Điều Trị Của Tôi</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Theo dõi tiến độ lộ trình điều trị nha khoa của bạn</p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : treatments.length === 0 ? (
        <EmptyState title="Bạn chưa có ca điều trị nào" />
      ) : (
        <div className="space-y-4">
          {treatments.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-dental-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">{t.service?.name}</h3>
                </div>
                <p className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Bác sĩ phụ trách: <strong>{t.doctor?.name}</strong>
                </p>
                <p className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày bắt đầu: <strong>{t.startDate}</strong> {t.endDate && `→ Kết thúc: ${t.endDate}`}
                </p>
                {t.notes && <p className="text-slate-500 italic">Ghi chú: "{t.notes}"</p>}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <p className="text-slate-400 font-bold uppercase">Chi phí</p>
                  <p className="text-base font-extrabold text-slate-900">{formatVND(t.cost)}</p>
                </div>
                <Badge status={t.status} type="treatment" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

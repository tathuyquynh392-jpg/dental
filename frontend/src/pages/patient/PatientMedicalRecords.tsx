import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MedicalRecord } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, Stethoscope, Calendar, Pill } from 'lucide-react';

export const PatientMedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-records');
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Lịch Sử Khám Bệnh Của Tôi</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Chi tiết kết quả chẩn đoán, điều trị và đơn thuốc từ bác sĩ</p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : records.length === 0 ? (
        <EmptyState title="Bạn chưa có hồ sơ khám bệnh nào" />
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-dental-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Bác sĩ: {r.doctor?.name}</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">Ngày khám: {r.createdAt?.substring(0, 10)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Triệu chứng:</span>
                  <p className="font-semibold text-slate-800">{r.symptoms}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Chẩn đoán:</span>
                  <p className="font-extrabold text-slate-900">{r.diagnosis}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-emerald-800 font-bold block mb-1">Phương pháp điều trị:</span>
                  <p className="font-extrabold text-emerald-800">{r.treatment}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="text-sky-800 font-bold block mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" /> Đơn thuốc kê đơn:
                  </span>
                  <p className="font-semibold text-sky-900">{r.prescription || 'Không có đơn thuốc'}</p>
                </div>
              </div>

              {r.followUpDate && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Ngày hẹn tái khám dự kiến: {r.followUpDate}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

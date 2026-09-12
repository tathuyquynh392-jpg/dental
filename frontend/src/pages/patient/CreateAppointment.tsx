import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Doctor, Service } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ToothIcon } from '../../components/common/ToothIcon';
import { Calendar, Clock, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const CreateAppointment: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [serviceId, setServiceId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([
        api.get('/services?status=ACTIVE'),
        api.get('/doctors?status=ACTIVE'),
      ]);
      if (sRes.data.success) {
        setServices(sRes.data.data);
        if (sRes.data.data.length > 0) setServiceId(String(sRes.data.data[0].id));
      }
      if (dRes.data.success) {
        setDoctors(dRes.data.data);
        if (dRes.data.data.length > 0) setDoctorId(String(dRes.data.data[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!serviceId || !doctorId || !appointmentDate || !appointmentTime) {
      setErrorMsg('Vui lòng chọn đầy đủ Dịch vụ, Bác sĩ, Ngày và Giờ khám');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/appointments', {
        serviceId: Number(serviceId),
        doctorId: Number(doctorId),
        appointmentDate,
        appointmentTime,
        notes,
      });

      if (res.data.success) {
        showToast('Đặt lịch thành công. Vui lòng chờ phòng khám xác nhận.', 'success');
        navigate('/patient/appointments');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể đặt lịch hẹn';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedServiceObj = services.find((s) => s.id === Number(serviceId));
  const selectedDoctorObj = doctors.find((d) => d.id === Number(doctorId));

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Đặt Lịch Khám Online</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Chọn dịch vụ nha khoa, bác sĩ và khung giờ tiện lợi cho bạn
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Service */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-dental-600" />
              1. Chọn Dịch Vụ Nha Khoa <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setServiceId(String(s.id))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    serviceId === String(s.id)
                      ? 'border-dental-500 bg-dental-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{s.name}</span>
                    <span className="font-bold text-xs text-dental-600">{formatVND(s.price)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Doctor */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-dental-600" />
              2. Chọn Bác Sĩ Phụ Trách <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setDoctorId(String(d.id))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    doctorId === String(d.id)
                      ? 'border-dental-500 bg-dental-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-xs text-slate-900 block">{d.name}</span>
                  <span className="text-[11px] text-dental-600 font-semibold block mt-0.5">{d.specialty}</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Lịch: {d.workingDays} ({d.workingHours})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 & 4: Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-dental-600" />
                3. Chọn Ngày Khám <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-dental-600" />
                4. Chọn Khung Giờ Khám <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setAppointmentTime(slot)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      appointmentTime === slot
                        ? 'bg-dental-600 text-white border-dental-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              5. Ghi chú mô tả triệu chứng hoặc yêu cầu khác
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Răng bị ê buốt khi ăn lạnh, muốn kiểm tra thêm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">Xác nhận thông tin đặt lịch:</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <p>Dịch vụ: <strong className="text-slate-900">{selectedServiceObj?.name}</strong></p>
              <p>Chi phí dự kiến: <strong className="text-dental-700">{formatVND(selectedServiceObj?.price || 0)}</strong></p>
              <p>Bác sĩ: <strong className="text-slate-900">{selectedDoctorObj?.name}</strong></p>
              <p>Khung giờ: <strong className="text-slate-900">{appointmentDate} lúc {appointmentTime}</strong></p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-dental-600 hover:bg-dental-700 text-white font-extrabold text-xs shadow-lg shadow-dental-200 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              {submitting ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận đặt lịch khám
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

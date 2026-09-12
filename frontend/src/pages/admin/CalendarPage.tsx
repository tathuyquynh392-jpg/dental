import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Calendar as CalendarIcon, Clock, User, Stethoscope, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments?limit=100');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    if (viewMode === 'day') {
      return app.appointmentDate === formattedSelectedDate;
    }
    return true; // For month & week views, show grid events
  });

  const getAppointmentsForDay = (dateStr: string) => {
    return appointments.filter((a) => a.appointmentDate === dateStr);
  };

  // Calendar Grid Builder for Month View
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setSelectedDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      setSelectedDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setSelectedDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      setSelectedDate(d);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lịch Khám Dạng Calendar</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Theo dõi trực quan lịch hẹn khám theo Ngày, Tuần, Tháng</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'day' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'week' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'month' ? 'bg-dental-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="text-base font-extrabold text-slate-800">
            {viewMode === 'month' && `Tháng ${month + 1} - ${year}`}
            {viewMode === 'day' && `Ngày ${selectedDate.toLocaleDateString('vi-VN')}`}
            {viewMode === 'week' && `Lịch hẹn tuần này`}
          </h3>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-xs font-bold text-dental-600 hover:underline px-3 py-1.5"
        >
          Hôm nay
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <>
          {/* Month View Grid */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                <div>CN</div>
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div>T7</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty slots before first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-32 bg-slate-50/50 rounded-2xl border border-slate-100/50"></div>
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayApps = getAppointmentsForDay(dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={dayNum}
                      className={`h-32 p-2 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                        isToday ? 'border-dental-500 bg-dental-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isToday ? 'bg-dental-600 text-white' : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayApps.length > 0 && (
                          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            {dayApps.length} lịch
                          </span>
                        )}
                      </div>

                      {/* Appointments List Pill */}
                      <div className="space-y-1 overflow-y-auto max-h-20 text-[10px]">
                        {dayApps.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => setSelectedApp(a)}
                            className="p-1 rounded-lg bg-dental-100/70 hover:bg-dental-200 text-dental-900 font-semibold cursor-pointer truncate transition-colors"
                          >
                            <strong>{a.appointmentTime}</strong> - {a.patient?.user?.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day & Week View */}
          {(viewMode === 'day' || viewMode === 'week') && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">
                Danh sách lịch hẹn ({filteredAppointments.length})
              </h3>
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dental-600 text-white font-extrabold text-xs flex flex-col items-center justify-center">
                      <Clock className="w-4 h-4 mb-0.5" />
                      {app.appointmentTime}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{app.patient?.user?.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Bác sĩ: {app.doctor?.name} | Dịch vụ: {app.service?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{app.appointmentDate}</span>
                    <Badge status={app.status} type="appointment" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Chi Tiết Lịch Hẹn Khám"
        maxWidth="md"
      >
        {selectedApp && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-500">Mã cuộc hẹn: #{selectedApp.id}</span>
              <Badge status={selectedApp.status} type="appointment" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-dental-600" />
                <span className="text-slate-500 font-medium">Bệnh nhân:</span>
                <strong className="text-slate-900 font-extrabold">{selectedApp.patient?.user?.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-dental-600" />
                <span className="text-slate-500 font-medium">Bác sĩ phụ trách:</span>
                <strong className="text-slate-900 font-extrabold">{selectedApp.doctor?.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dental-600" />
                <span className="text-slate-500 font-medium">Dịch vụ nha khoa:</span>
                <strong className="text-dental-700 font-extrabold">{selectedApp.service?.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-dental-600" />
                <span className="text-slate-500 font-medium">Thời gian hẹn:</span>
                <strong className="text-slate-900 font-extrabold">{selectedApp.appointmentDate} lúc {selectedApp.appointmentTime}</strong>
              </div>
            </div>

            {selectedApp.notes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                <span className="font-bold block mb-0.5">Ghi chú:</span>
                <p className="font-medium">{selectedApp.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

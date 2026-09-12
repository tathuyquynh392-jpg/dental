import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Appointment, Doctor, Service, Patient, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, CalendarCheck, Plus, Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorIdFilter, setDoctorIdFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals & Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '09:00',
    notes: '',
    status: 'PENDING',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter, doctorIdFilter, dateFilter, page, limit]);

  const fetchOptions = async () => {
    try {
      const [docRes, srvRes, patRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/services'),
        api.get('/patients?limit=100'),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.data);
      if (srvRes.data.success) setServices(srvRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments', {
        params: {
          search,
          status: statusFilter,
          doctorId: doctorIdFilter,
          date: dateFilter,
          page,
          limit,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải danh sách lịch hẹn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormData({
      patientId: patients.length > 0 ? String(patients[0].id) : '',
      doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
      serviceId: services.length > 0 ? String(services[0].id) : '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      notes: '',
      status: 'PENDING',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setEditingApp(app);
    setFormData({
      patientId: String(app.patientId),
      doctorId: String(app.doctorId),
      serviceId: String(app.serviceId),
      appointmentDate: app.appointmentDate,
      appointmentTime: app.appointmentTime,
      notes: app.notes || '',
      status: app.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingApp) {
        await api.put(`/appointments/${editingApp.id}`, formData);
        showToast('Cập nhật lịch hẹn thành công', 'success');
      } else {
        await api.post('/appointments', formData);
        showToast('Tạo lịch hẹn mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tạo/cập nhật lịch hẹn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (appId: number, status: string) => {
    try {
      await api.put(`/appointments/${appId}`, { status });
      showToast(`Đã chuyển trạng thái sang ${status}`, 'success');
      fetchAppointments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/appointments/${deleteId}`);
      showToast('Đã xóa lịch hẹn', 'success');
      setDeleteId(null);
      fetchAppointments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa lịch hẹn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Lịch Hẹn Khám</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Danh sách và kiểm tra trùng lịch khám phòng khám</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Tạo lịch hẹn mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm Bệnh nhân, Bác sĩ, Dịch vụ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="NO_SHOW">Vắng mặt</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Bác sĩ:</span>
            <select
              value={doctorIdFilter}
              onChange={(e) => {
                setDoctorIdFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Tất cả bác sĩ</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : appointments.length === 0 ? (
        <EmptyState title="Không tìm thấy lịch hẹn nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Mã LH</th>
                  <th className="py-3.5 px-6">Bệnh nhân</th>
                  <th className="py-3.5 px-6">Bác sĩ</th>
                  <th className="py-3.5 px-6">Dịch vụ</th>
                  <th className="py-3.5 px-6">Thời gian</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{a.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-slate-900">{a.patient?.user?.name || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{a.patient?.user?.phone}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{a.doctor?.name}</td>
                    <td className="py-4 px-6 font-semibold text-dental-700">{a.service?.name}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{a.appointmentDate}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{a.appointmentTime}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={a.status} type="appointment" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === 'PENDING' && (
                          <button
                            onClick={() => handleQuickStatus(a.id, 'CONFIRMED')}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Xác nhận lịch"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={meta}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Modal Add/Edit Appointment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Chỉnh Sửa Lịch Hẹn Khám' : 'Đặt Lịch Hẹn Khám Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bệnh nhân <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="">-- Chọn bệnh nhân --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.name} - {p.user?.phone} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bác sĩ <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dịch vụ nha khoa <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.price.toLocaleString('vi-VN')} đ</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày khám <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giờ khám <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="08:00">08:00 AM</option>
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái cuộc hẹn</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="PENDING">Chờ xác nhận (PENDING)</option>
              <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
              <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              <option value="NO_SHOW">Vắng mặt (NO_SHOW)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú bệnh nhân</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú yêu cầu..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-dental-600 hover:bg-dental-700 text-white text-xs font-bold shadow-md shadow-dental-200"
            >
              {submitting ? 'Đang xử lý...' : editingApp ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa lịch hẹn"
        message="Bạn có chắc chắn muốn xóa lịch hẹn này?"
        loading={submitting}
      />
    </div>
  );
};

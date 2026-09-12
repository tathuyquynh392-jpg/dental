import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Treatment, Patient, Doctor, Service, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Activity, Plus, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';

export const TreatmentList: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    serviceId: '',
    startDate: '',
    endDate: '',
    cost: 0,
    status: 'IN_PROGRESS',
    notes: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchTreatments();
  }, [search, statusFilter, page, limit]);

  const fetchOptions = async () => {
    try {
      const [pRes, dRes, sRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/doctors'),
        api.get('/services'),
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (dRes.data.success) setDoctors(dRes.data.data);
      if (sRes.data.success) setServices(sRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/treatments', {
        params: { search, status: statusFilter, page, limit },
      });
      if (res.data.success) {
        setTreatments(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải đợt điều trị', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTreatment(null);
    setFormData({
      patientId: patients.length > 0 ? String(patients[0].id) : '',
      doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
      serviceId: services.length > 0 ? String(services[0].id) : '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      cost: services.length > 0 ? services[0].price : 1000000,
      status: 'IN_PROGRESS',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tr: Treatment) => {
    setEditingTreatment(tr);
    setFormData({
      patientId: String(tr.patientId),
      doctorId: String(tr.doctorId),
      serviceId: String(tr.serviceId),
      startDate: tr.startDate,
      endDate: tr.endDate || '',
      cost: tr.cost,
      status: tr.status,
      notes: tr.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingTreatment) {
        await api.put(`/treatments/${editingTreatment.id}`, formData);
        showToast('Cập nhật đợt điều trị thành công', 'success');
      } else {
        await api.post('/treatments', formData);
        showToast('Thêm đợt điều trị mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchTreatments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi lưu ca điều trị', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/treatments/${deleteId}`);
      showToast('Đã xóa ca điều trị', 'success');
      setDeleteId(null);
      fetchTreatments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa ca điều trị', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Quá Trình Điều Trị</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Theo dõi tiến độ lộ trình điều trị nha khoa chuyên sâu</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo đợt điều trị mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Bệnh nhân, Bác sĩ, Dịch vụ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tất cả</option>
            <option value="NOT_STARTED">Chưa bắt đầu</option>
            <option value="IN_PROGRESS">Đang điều trị</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : treatments.length === 0 ? (
        <EmptyState title="Chưa có ca điều trị nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Bệnh nhân</th>
                  <th className="py-3.5 px-6">Bác sĩ phụ trách</th>
                  <th className="py-3.5 px-6">Dịch vụ điều trị</th>
                  <th className="py-3.5 px-6">Thời gian</th>
                  <th className="py-3.5 px-6">Chi phí</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {treatments.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{t.id}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">{t.patient?.user?.name}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{t.doctor?.name}</td>
                    <td className="py-4 px-6 font-bold text-dental-700">{t.service?.name}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{t.startDate}</p>
                      <p className="text-[11px] text-slate-400">Đến: {t.endDate || 'Chưa kết thúc'}</p>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">{formatVND(t.cost)}</td>
                    <td className="py-4 px-6">
                      <Badge status={t.status} type="treatment" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
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

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} onLimitChange={(l) => setLimit(l)} />
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTreatment ? 'Chỉnh Sửa Ca Điều Trị' : 'Tạo Đợt Điều Trị Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bệnh nhân *</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.name} (#{p.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bác sĩ phụ trách *</label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dịch vụ điều trị *</label>
              <select
                value={formData.serviceId}
                onChange={(e) => {
                  const sId = e.target.value;
                  const selectedSrv = services.find((s) => s.id === Number(sId));
                  setFormData({
                    ...formData,
                    serviceId: sId,
                    cost: selectedSrv ? selectedSrv.price : formData.cost,
                  });
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.price.toLocaleString('vi-VN')} đ</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chi phí (VND) *</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc dự kiến</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái lộ trình</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="NOT_STARTED">Chưa bắt đầu</option>
              <option value="IN_PROGRESS">Đang điều trị</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PAUSED">Tạm dừng</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú lộ trình</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {submitting ? 'Đang xử lý...' : editingTreatment ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa ca điều trị"
        message="Bạn có chắc chắn muốn xóa ca điều trị này?"
        loading={submitting}
      />
    </div>
  );
};

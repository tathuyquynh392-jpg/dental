import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MedicalRecord, Patient, Doctor } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Plus, Edit2, Trash2, FileText, Stethoscope, User, Calendar } from 'lucide-react';

export const MedicalRecordList: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState<any>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    symptoms: '',
    diagnosis: '',
    dentalCondition: '',
    treatment: '',
    notes: '',
    prescription: '',
    followUpDate: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [search, page, limit]);

  const fetchOptions = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/doctors'),
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (dRes.data.success) setDoctors(dRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-records', { params: { search, page, limit } });
      if (res.data.success) {
        setRecords(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải hồ sơ bệnh án', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      patientId: patients.length > 0 ? String(patients[0].id) : '',
      doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
      symptoms: '',
      diagnosis: '',
      dentalCondition: '',
      treatment: '',
      notes: '',
      prescription: '',
      followUpDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: MedicalRecord) => {
    setEditingRecord(rec);
    setFormData({
      patientId: String(rec.patientId),
      doctorId: String(rec.doctorId),
      symptoms: rec.symptoms,
      diagnosis: rec.diagnosis,
      dentalCondition: rec.dentalCondition,
      treatment: rec.treatment,
      notes: rec.notes || '',
      prescription: rec.prescription || '',
      followUpDate: rec.followUpDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingRecord) {
        await api.put(`/medical-records/${editingRecord.id}`, formData);
        showToast('Cập nhật hồ sơ bệnh án thành công', 'success');
      } else {
        await api.post('/medical-records', formData);
        showToast('Tạo hồ sơ khám bệnh mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi lưu hồ sơ khám', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/medical-records/${deleteId}`);
      showToast('Đã xóa hồ sơ khám bệnh', 'success');
      setDeleteId(null);
      fetchRecords();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa hồ sơ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Hồ Sơ Bệnh Án</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Ghi nhận triệu chứng, chẩn đoán và đơn thuốc của bệnh nhân</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo hồ sơ khám mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Bệnh nhân, Bác sĩ, Chẩn đoán..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : records.length === 0 ? (
        <EmptyState title="Chưa có hồ sơ khám bệnh nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Bệnh nhân</th>
                  <th className="py-3.5 px-6">Bác sĩ khám</th>
                  <th className="py-3.5 px-6">Chẩn đoán & Triệu chứng</th>
                  <th className="py-3.5 px-6">Điều trị</th>
                  <th className="py-3.5 px-6">Ngày tái khám</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{r.id}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">{r.patient?.user?.name}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{r.doctor?.name}</td>
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-slate-900">{r.diagnosis}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{r.symptoms}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-700">{r.treatment}</td>
                    <td className="py-4 px-6 font-semibold">{r.followUpDate || 'Không có'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Chỉnh Sửa Hồ Sơ Bệnh Án' : 'Tạo Hồ Sơ Khám Bệnh Mới'}
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
                  <option key={p.id} value={p.id}>{p.user?.name} - {p.user?.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bác sĩ khám *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Triệu chứng ban đầu *</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chẩn đoán y khoa *</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tình trạng răng miệng</label>
              <input
                type="text"
                value={formData.dentalCondition}
                onChange={(e) => setFormData({ ...formData, dentalCondition: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phương pháp điều trị *</label>
              <input
                type="text"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đơn thuốc kê đơn</label>
            <textarea
              rows={2}
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="VD: Augmentin 1g, Efferalgan 500mg..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày tái khám dự kiến</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú bác sĩ</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
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
              {submitting ? 'Đang xử lý...' : editingRecord ? 'Cập nhật' : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa hồ sơ"
        message="Bạn có chắc chắn muốn xóa hồ sơ khám bệnh này?"
        loading={submitting}
      />
    </div>
  );
};

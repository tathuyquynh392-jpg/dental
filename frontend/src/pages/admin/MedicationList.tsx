import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Medication, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Pill, AlertTriangle, AlertCircle, Clock, Plus, Edit2, Trash2 } from 'lucide-react';

export const MedicationList: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Kháng sinh',
    unit: 'Viên',
    quantity: 100,
    price: 5000,
    expiryDate: '2027-12-31',
    supplier: 'Dược Hậu Giang',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchMedications();
  }, [search, statusFilter, page, limit]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medications', {
        params: { search, status: statusFilter, page, limit },
      });
      if (res.data.success) {
        setMedications(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi lấy danh sách kho thuốc', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMedication(null);
    setFormData({
      name: '',
      category: 'Kháng sinh',
      unit: 'Viên',
      quantity: 100,
      price: 5000,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplier: 'Dược Hậu Giang',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medication) => {
    setEditingMedication(med);
    setFormData({
      name: med.name,
      category: med.category,
      unit: med.unit,
      quantity: med.quantity,
      price: med.price,
      expiryDate: med.expiryDate,
      supplier: med.supplier,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingMedication) {
        await api.put(`/medications/${editingMedication.id}`, formData);
        showToast('Cập nhật thông tin thuốc thành công', 'success');
      } else {
        await api.post('/medications', formData);
        showToast('Thêm thuốc mới vào kho thành công', 'success');
      }
      setIsModalOpen(false);
      fetchMedications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi lưu thông tin thuốc', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/medications/${deleteId}`);
      showToast('Xóa thuốc khỏi kho thành công', 'success');
      setDeleteId(null);
      fetchMedications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa thuốc', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const warnings = meta?.warnings || { lowStock: 0, outOfStock: 0, nearExpiry: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Thuốc & Dược Phẩm</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Quản lý kho dược, kiểm soát tồn kho và cảnh báo hết hạn</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm thuốc vào kho
        </button>
      </div>

      {/* Stock Warnings Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-900">Thuốc sắp hết hàng</p>
              <p className="text-[11px] text-amber-700 font-medium">Số lượng ≤ 10 đơn vị</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-amber-700">{warnings.lowStock}</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-rose-900">Thuốc đã hết hàng</p>
              <p className="text-[11px] text-rose-700 font-medium">Cần nhập thêm ngay</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-rose-700">{warnings.outOfStock}</span>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-purple-900">Sắp hết hạn sử dụng</p>
              <p className="text-[11px] text-purple-700 font-medium">Hạn sử dụng ≤ 30 ngày</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-purple-700">{warnings.nearExpiry}</span>
        </div>
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
            placeholder="Tìm Tên thuốc, Loại, Nhà cung cấp..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Trạng thái kho:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tất cả</option>
            <option value="AVAILABLE">Còn hàng</option>
            <option value="LOW_STOCK">Sắp hết hàng</option>
            <option value="OUT_OF_STOCK">Đã hết hàng</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : medications.length === 0 ? (
        <EmptyState title="Không tìm thấy loại thuốc nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Tên thuốc</th>
                  <th className="py-3.5 px-6">Loại thuốc</th>
                  <th className="py-3.5 px-6">Số lượng trong kho</th>
                  <th className="py-3.5 px-6">Đơn giá</th>
                  <th className="py-3.5 px-6">Hạn sử dụng</th>
                  <th className="py-3.5 px-6">Nhà cung cấp</th>
                  <th className="py-3.5 px-6">Cảnh báo</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {medications.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">{m.name}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{m.category}</td>
                    <td className="py-4 px-6">
                      <span className={`font-extrabold text-sm ${m.quantity === 0 ? 'text-rose-600' : m.quantity <= 10 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {m.quantity} {m.unit}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{formatVND(m.price)}</td>
                    <td className="py-4 px-6 font-semibold">{m.expiryDate}</td>
                    <td className="py-4 px-6 text-slate-600">{m.supplier}</td>
                    <td className="py-4 px-6">
                      <Badge status={m.status} type="medication" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(m.id)}
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
        title={editingMedication ? 'Chỉnh Sửa Thông Tin Thuốc' : 'Thêm Thuốc Mới Vào Kho'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên thuốc *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại thuốc *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giá bán / Đơn vị (VND) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hạn sử dụng *</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp *</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
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
              {submitting ? 'Đang xử lý...' : editingMedication ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa thuốc"
        message="Bạn có chắc chắn muốn xóa thuốc này khỏi kho?"
        loading={submitting}
      />
    </div>
  );
};

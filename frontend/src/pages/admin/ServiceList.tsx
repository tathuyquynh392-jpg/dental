import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Service, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Sparkles, Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';

export const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    status: 'ACTIVE',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [search, statusFilter, page, limit]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services', {
        params: { search, status: statusFilter, page, limit },
      });
      if (res.data.success) {
        setServices(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải danh sách dịch vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 300000,
      duration: 30,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Service) => {
    setEditingService(s);
    setFormData({
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name || !formData.name.trim()) {
      showToast('Vui lòng nhập tên dịch vụ nha khoa', 'error');
      return false;
    }
    if (formData.price < 0 || isNaN(formData.price)) {
      showToast('Giá dịch vụ phải lớn hơn hoặc bằng 0', 'error');
      return false;
    }
    if (formData.duration <= 0 || isNaN(formData.duration)) {
      showToast('Thời gian thực hiện phải lớn hơn 0 phút', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        showToast('Cập nhật dịch vụ nha khoa thành công', 'success');
      } else {
        await api.post('/services', formData);
        showToast('Thêm dịch vụ nha khoa mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/services/${deleteId}`);
      showToast('Đã xóa dịch vụ nha khoa', 'success');
      setDeleteId(null);
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa dịch vụ', 'error');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Dịch Vụ Nha Khoa</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Danh mục và bảng giá dịch vụ phòng khám</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Thêm dịch vụ mới
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
            placeholder="Tìm theo Tên dịch vụ, Mô tả..."
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
            <option value="ACTIVE">Đang cung cấp</option>
            <option value="INACTIVE">Tạm ngưng</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : services.length === 0 ? (
        <EmptyState title="Không tìm thấy dịch vụ phù hợp" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-dental-600 bg-dental-50 px-2.5 py-1 rounded-lg">
                    #{s.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{s.name}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                  {s.description || 'Không có mô tả chi tiết'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Đơn giá</p>
                  <p className="text-base font-extrabold text-dental-700">{formatVND(s.price)}</p>
                  <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {s.duration} phút
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(s)}
                    className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Chỉnh Sửa Dịch Vụ Nha Khoa' : 'Thêm Dịch Vụ Nha Khoa Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên dịch vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả dịch vụ</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giá dịch vụ (VND) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thời gian thực hiện (Phút) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                required
                min={5}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái cung cấp</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="ACTIVE">Đang cung cấp (Hiện)</option>
              <option value="INACTIVE">Tạm ngưng (Ẩn)</option>
            </select>
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
              {submitting ? 'Đang xử lý...' : editingService ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa dịch vụ"
        message="Bạn có chắc muốn xóa dịch vụ nha khoa này khỏi bảng giá?"
        loading={submitting}
      />
    </div>
  );
};

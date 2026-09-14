import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Patient, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, ArrowUpDown, UserPlus, Eye, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form & Error State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Nam',
    address: '',
    medicalHistory: '',
    allergy: '',
    notes: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [search, genderFilter, statusFilter, sort, order, page, limit]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        gender: genderFilter,
        status: statusFilter,
        sort,
        order,
        page,
        limit,
      };
      const res = await api.get('/patients', { params });
      if (res.data.success) {
        setPatients(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải danh sách bệnh nhân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ và tên bệnh nhân';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      const phoneRegex = /^[0-9+\s-]{9,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)';
      }
    }

    if (!editingPatient) {
      if (!formData.email || !formData.email.trim()) {
        errors.email = 'Vui lòng nhập địa chỉ email';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          errors.email = 'Địa chỉ email không đúng định dạng (VD: example@gmail.com)';
        }
      }
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    } else if (new Date(formData.dateOfBirth) > new Date()) {
      errors.dateOfBirth = 'Ngày sinh không thể nằm ở tương lai';
    }

    if (!formData.address || !formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ bệnh nhân';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormErrors({});
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '1995-05-15',
      gender: 'Nam',
      address: '',
      medicalHistory: '',
      allergy: '',
      notes: '',
      password: 'patient123',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormErrors({});
    setFormData({
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      phone: patient.user?.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'Nam',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
      allergy: patient.allergy || '',
      notes: patient.notes || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin nhập liệu', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData);
        showToast('Cập nhật thông tin bệnh nhân thành công', 'success');
      } else {
        await api.post('/patients', formData);
        showToast('Thêm bệnh nhân mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      showToast(errMsg, 'error');
      if (errMsg.toLowerCase().includes('email')) {
        setFormErrors((prev) => ({ ...prev, email: errMsg }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/patients/${deleteId}`);
      showToast('Đã xóa bệnh nhân và dữ liệu liên quan khỏi hệ thống', 'success');
      setDeleteId(null);
      fetchPatients();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa bệnh nhân', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Bệnh Nhân</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Danh sách hồ sơ bệnh nhân toàn hệ thống Lucky Dental
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          Thêm bệnh nhân mới
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Tên, Email, SĐT..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Giới tính:</span>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Sắp xếp:</span>
            <select
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split('-');
                setSort(s);
                setOrder(o as 'asc' | 'desc');
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bệnh nhân phù hợp"
          description="Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc."
          actionButton={
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-dental-600 text-white text-xs font-bold shadow-md shadow-dental-200"
            >
              Thêm bệnh nhân
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Họ tên & Thông tin</th>
                  <th className="py-3.5 px-6">Ngày sinh</th>
                  <th className="py-3.5 px-6">Giới tính</th>
                  <th className="py-3.5 px-6">Địa chỉ</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{p.id}</td>
                    <td className="py-4 px-6">
                      <Link to={`/admin/patients/${p.id}`} className="font-extrabold text-slate-900 hover:text-dental-600 transition-colors">
                        {p.user?.name}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {p.user?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {p.user?.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{p.dateOfBirth}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                        {p.gender}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {p.address}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={p.user?.status || 'ACTIVE'} type="user" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/patients/${p.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-dental-600 hover:bg-slate-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Xóa bệnh nhân"
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

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Chỉnh Sửa Thông Tin Bệnh Nhân' : 'Thêm Bệnh Nhân Mới'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                  formErrors.name ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-dental-500'
                }`}
                placeholder="VD: Nguyễn Văn An"
              />
              {formErrors.name && <p className="text-[11px] font-semibold text-rose-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                  formErrors.phone ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-dental-500'
                }`}
                placeholder="VD: 0988123456"
              />
              {formErrors.phone && <p className="text-[11px] font-semibold text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                }}
                disabled={!!editingPatient}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 disabled:bg-slate-100 ${
                  formErrors.email ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-dental-500'
                }`}
                placeholder="VD: an.nguyen@gmail.com"
              />
              {formErrors.email && <p className="text-[11px] font-semibold text-rose-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => {
                  setFormData({ ...formData, dateOfBirth: e.target.value });
                  if (formErrors.dateOfBirth) setFormErrors({ ...formErrors, dateOfBirth: '' });
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                  formErrors.dateOfBirth ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-dental-500'
                }`}
              />
              {formErrors.dateOfBirth && <p className="text-[11px] font-semibold text-rose-500 mt-1">{formErrors.dateOfBirth}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới tính <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 ${
                  formErrors.address ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-dental-500'
                }`}
                placeholder="VD: 123 Nguyễn Trãi, Quận 5, TP.HCM"
              />
              {formErrors.address && <p className="text-[11px] font-semibold text-rose-500 mt-1">{formErrors.address}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiền sử bệnh lý</label>
            <input
              type="text"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="VD: Cao huyết áp, dị ứng nhẹ..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dị ứng thuốc & Ghi chú</label>
            <textarea
              rows={2}
              value={formData.allergy}
              onChange={(e) => setFormData({ ...formData, allergy: e.target.value })}
              placeholder="Nhập dị ứng thuốc hoặc lưu ý..."
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
              className="px-5 py-2 rounded-xl bg-dental-600 hover:bg-dental-700 text-white text-xs font-bold shadow-md shadow-dental-200 disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : editingPatient ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bệnh nhân"
        message="Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân này? Thao tác này sẽ xóa toàn bộ lịch hẹn, bệnh án và hóa đơn liên quan."
        loading={submitting}
      />
    </div>
  );
};

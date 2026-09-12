import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Payment, Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, CreditCard, Plus, Trash2 } from 'lucide-react';

export const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState<any>();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [search, methodFilter, page, limit]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices?status=UNPAID&limit=100');
      if (res.data.success) setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments', {
        params: { search, paymentMethod: methodFilter, page, limit },
      });
      if (res.data.success) {
        setPayments(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải lịch sử thanh toán', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    const defaultInv = invoices.length > 0 ? invoices[0] : null;
    setFormData({
      invoiceId: defaultInv ? String(defaultInv.id) : '',
      amount: defaultInv ? Math.max(0, defaultInv.total - defaultInv.paidAmount) : 500000,
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().split('T')[0],
      note: 'Thanh toán trực tiếp tại quầy thu ngân',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId || formData.amount <= 0) {
      showToast('Vui lòng chọn Hóa đơn và nhập số tiền lớn hơn 0', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/payments', formData);
      showToast('Ghi nhận giao dịch thanh toán thành công', 'success');
      setIsModalOpen(false);
      fetchPayments();
      fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tạo giao dịch thanh toán', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/payments/${deleteId}`);
      showToast('Đã xóa lịch sử thanh toán', 'success');
      setDeleteId(null);
      fetchPayments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa giao dịch', 'error');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Giao Dịch Thanh Toán</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Lịch sử thu tiền mặt, chuyển khoản và quẹt thẻ</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thu tiền mới
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
            placeholder="Tìm theo Mã TT, Mã HD, Bệnh nhân..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Phương thức:</span>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tất cả</option>
            <option value="CASH">Tiền mặt</option>
            <option value="TRANSFER">Chuyển khoản</option>
            <option value="CARD">Thẻ Quẹt</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : payments.length === 0 ? (
        <EmptyState title="Chưa có giao dịch thanh toán nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Mã TT</th>
                  <th className="py-3.5 px-6">Mã Hóa Đơn</th>
                  <th className="py-3.5 px-6">Bệnh nhân</th>
                  <th className="py-3.5 px-6">Số tiền thu</th>
                  <th className="py-3.5 px-6">Phương thức</th>
                  <th className="py-3.5 px-6">Ngày thanh toán</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">{p.paymentCode}</td>
                    <td className="py-4 px-6 font-bold text-dental-600">{p.invoice?.invoiceCode}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{p.invoice?.patient?.user?.name}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-600 text-sm">{formatVND(p.amount)}</td>
                    <td className="py-4 px-6">
                      <Badge status={p.paymentMethod} type="payment" />
                    </td>
                    <td className="py-4 px-6 font-semibold">{p.paymentDate}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} onLimitChange={(l) => setLimit(l)} />
        </div>
      )}

      {/* Modal Add Payment */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ghi Nhận Thu Tiền Thanh Toán" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn hóa đơn chưa thanh toán đủ *</label>
            <select
              value={formData.invoiceId}
              onChange={(e) => {
                const invId = Number(e.target.value);
                const inv = invoices.find((i) => i.id === invId);
                setFormData({
                  ...formData,
                  invoiceId: String(invId),
                  amount: inv ? Math.max(0, inv.total - inv.paidAmount) : formData.amount,
                });
              }}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="">-- Chọn hóa đơn --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceCode} - {inv.patient?.user?.name} (Còn nợ: {(inv.total - inv.paidAmount).toLocaleString('vi-VN')} đ)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền nộp (VND) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
                min={1000}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phương thức *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="CASH">Tiền mặt (CASH)</option>
                <option value="TRANSFER">Chuyển khoản (TRANSFER)</option>
                <option value="CARD">Thẻ Quẹt (CARD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ngày thu *</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thanh toán</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
              {submitting ? 'Đang xử lý...' : 'Xác nhận thu tiền'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa giao dịch"
        message="Bạn có chắc muốn xóa lịch sử thanh toán này?"
        loading={submitting}
      />
    </div>
  );
};

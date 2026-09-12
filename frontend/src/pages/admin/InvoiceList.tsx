import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Invoice, Patient, Service, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Receipt, Plus, Eye, Trash2, Printer, CheckCircle } from 'lucide-react';

export const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Invoice Form
  const [patientId, setPatientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  const [selectedServices, setSelectedServices] = useState<{ serviceId: number; description: string; quantity: number; unitPrice: number }[]>([]);

  const { showToast } = useToast();

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, page, limit]);

  const fetchOptions = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/services'),
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (sRes.data.success) setServices(sRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices', {
        params: { search, status: statusFilter, page, limit },
      });
      if (res.data.success) {
        setInvoices(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải hóa đơn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setPatientId(patients.length > 0 ? String(patients[0].id) : '');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDiscount(0);
    if (services.length > 0) {
      setSelectedServices([{ serviceId: services[0].id, description: services[0].name, quantity: 1, unitPrice: services[0].price }]);
    } else {
      setSelectedServices([]);
    }
    setIsModalOpen(true);
  };

  const handleAddServiceItem = () => {
    if (services.length > 0) {
      setSelectedServices((prev) => [
        ...prev,
        { serviceId: services[0].id, description: services[0].name, quantity: 1, unitPrice: services[0].price },
      ]);
    }
  };

  const handleRemoveServiceItem = (index: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || selectedServices.length === 0) {
      showToast('Vui lòng chọn bệnh nhân và ít nhất 1 dịch vụ thanh toán', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/invoices', {
        patientId,
        invoiceDate,
        discount,
        items: selectedServices,
      });
      showToast('Tạo hóa đơn thanh toán mới thành công', 'success');
      setIsModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tạo hóa đơn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/invoices/${deleteId}`);
      showToast('Đã xóa hóa đơn', 'success');
      setDeleteId(null);
      fetchInvoices();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa hóa đơn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Hóa Đơn Thanh Toán</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Tạo, xuất và theo dõi công nợ phòng khám Lucky Dental</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Lập hóa đơn mới
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
            placeholder="Tìm theo Mã HD, Tên bệnh nhân..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Trạng thái thanh toán:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tất cả</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PARTIAL">Thanh toán 1 phần</option>
            <option value="PAID">Đã thanh toán</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : invoices.length === 0 ? (
        <EmptyState title="Chưa có hóa đơn nào" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Mã HD</th>
                  <th className="py-3.5 px-6">Bệnh nhân</th>
                  <th className="py-3.5 px-6">Ngày lập</th>
                  <th className="py-3.5 px-6">Tổng tiền</th>
                  <th className="py-3.5 px-6">Đã thanh toán</th>
                  <th className="py-3.5 px-6">Còn nợ</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {invoices.map((inv) => {
                  const debt = Math.max(0, inv.total - inv.paidAmount);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-dental-600">{inv.invoiceCode}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">{inv.patient?.user?.name}</td>
                      <td className="py-4 px-6 font-semibold">{inv.invoiceDate}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">{formatVND(inv.total)}</td>
                      <td className="py-4 px-6 font-bold text-emerald-600">{formatVND(inv.paidAmount)}</td>
                      <td className="py-4 px-6 font-bold text-rose-600">{formatVND(debt)}</td>
                      <td className="py-4 px-6">
                        <Badge status={inv.status} type="invoice" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-dental-600 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết hóa đơn"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(inv.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Xóa hóa đơn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} onLimitChange={(l) => setLimit(l)} />
        </div>
      )}

      {/* Modal Add Invoice */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lập Hóa Đơn Thanh Toán Mới" maxWidth="2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bệnh nhân thanh toán *</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.name} - {p.user?.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày lập *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Chi tiết dịch vụ thanh toán</label>
              <button
                type="button"
                onClick={handleAddServiceItem}
                className="text-xs font-bold text-dental-600 hover:underline flex items-center gap-1"
              >
                + Thêm dịch vụ
              </button>
            </div>

            {selectedServices.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <select
                  value={item.serviceId}
                  onChange={(e) => {
                    const sId = Number(e.target.value);
                    const found = services.find((s) => s.id === sId);
                    const newArr = [...selectedServices];
                    newArr[idx] = {
                      serviceId: sId,
                      description: found ? found.name : item.description,
                      quantity: item.quantity,
                      unitPrice: found ? found.price : item.unitPrice,
                    };
                    setSelectedServices(newArr);
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    const newArr = [...selectedServices];
                    newArr[idx].quantity = Number(e.target.value);
                    setSelectedServices(newArr);
                  }}
                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold bg-white"
                  placeholder="SL"
                />

                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const newArr = [...selectedServices];
                    newArr[idx].unitPrice = Number(e.target.value);
                    setSelectedServices(newArr);
                  }}
                  className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  placeholder="Đơn giá"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveServiceItem(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giảm giá (VND)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div className="text-right flex flex-col justify-end">
              <span className="text-xs text-slate-500 font-bold">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-dental-600">
                {formatVND(Math.max(0, calculateSubtotal() - discount))}
              </span>
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
              {submitting ? 'Đang lập...' : 'Tạo hóa đơn'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Chi Tiết Hóa Đơn Thanh Toán" maxWidth="lg">
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-lg font-extrabold text-dental-600">{selectedInvoice.invoiceCode}</h4>
                <p className="text-slate-500 font-medium">Bệnh nhân: <strong className="text-slate-900">{selectedInvoice.patient?.user?.name}</strong></p>
                <p className="text-slate-500 font-medium">Ngày lập: {selectedInvoice.invoiceDate}</p>
              </div>
              <Badge status={selectedInvoice.status} type="invoice" />
            </div>

            <div className="border rounded-2xl border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Dịch vụ</th>
                    <th className="py-2.5 px-4 text-center">SL</th>
                    <th className="py-2.5 px-4 text-right">Đơn giá</th>
                    <th className="py-2.5 px-4 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 font-semibold">{item.description}</td>
                      <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right">{formatVND(item.unitPrice)}</td>
                      <td className="py-2.5 px-4 text-right font-bold">{formatVND(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-right border-t border-slate-100 pt-3">
              <p className="text-slate-500 font-medium">Tạm tính: <strong className="text-slate-900">{formatVND(selectedInvoice.subtotal)}</strong></p>
              <p className="text-slate-500 font-medium">Giảm giá: <strong className="text-slate-900">-{formatVND(selectedInvoice.discount)}</strong></p>
              <p className="text-base font-extrabold text-dental-600">Tổng cộng: {formatVND(selectedInvoice.total)}</p>
              <p className="text-emerald-600 font-bold">Đã thanh toán: {formatVND(selectedInvoice.paidAmount)}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In hóa đơn
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa hóa đơn"
        message="Bạn có chắc chắn muốn xóa hóa đơn này?"
        loading={submitting}
      />
    </div>
  );
};

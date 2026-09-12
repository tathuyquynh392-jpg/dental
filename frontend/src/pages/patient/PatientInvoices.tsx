import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Invoice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Receipt, Eye, Printer, CheckCircle2 } from 'lucide-react';

export const PatientInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Hóa Đơn & Thanh Toán Của Tôi</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Danh sách chi tiết hóa đơn dịch vụ tại Lucky Dental</p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : invoices.length === 0 ? (
        <EmptyState title="Bạn chưa có hóa đơn nào" />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const debt = Math.max(0, inv.total - inv.paidAmount);
            return (
              <div
                key={inv.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-dental-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">{inv.invoiceCode}</h3>
                    <Badge status={inv.status} type="invoice" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Ngày lập: {inv.invoiceDate}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right text-xs">
                    <p className="text-slate-400 font-bold">Tổng tiền: <strong className="text-slate-900">{formatVND(inv.total)}</strong></p>
                    <p className="text-slate-400 font-bold">Đã trả: <strong className="text-emerald-600">{formatVND(inv.paidAmount)}</strong></p>
                    {debt > 0 && <p className="text-rose-600 font-extrabold">Còn nợ: {formatVND(debt)}</p>}
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-dental-600 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Eye className="w-4 h-4" /> Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Detail Modal for Patient */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Chi Tiết Hóa Đơn Thanh Toán"
        maxWidth="lg"
      >
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In hóa đơn
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
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

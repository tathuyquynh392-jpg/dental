import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Notification, Patient } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Send, Trash2, CheckCircle2, Users } from 'lucide-react';

export const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    targetRole: 'ALL_PATIENTS',
    userId: '',
    title: '',
    message: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients?limit=100');
      if (res.data.success) setPatients(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi tải danh sách thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      showToast('Vui lòng nhập tiêu đề và nội dung thông báo', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/notifications', formData);
      showToast('Gửi thông báo thành công', 'success');
      setIsModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi gửi thông báo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/notifications/${deleteId}`);
      showToast('Đã xóa thông báo', 'success');
      setDeleteId(null);
      fetchNotifications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể xóa thông báo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Thông Báo & Nhắc Lịch</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Gửi thông báo nhắc lịch, ưu đãi và tin nhắn đến bệnh nhân</p>
        </div>
        <button
          onClick={() => {
            setFormData({ targetRole: 'ALL_PATIENTS', userId: '', title: '', message: '' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-dental-200 transition-all"
        >
          <Send className="w-4 h-4" />
          Tạo & Gửi thông báo
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState title="Chưa có thông báo nào trong hệ thống" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-dental-50 text-dental-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold mt-2">
                    <span>Gửi đến: <strong className="text-slate-700">{(n as any).user?.name || 'Tất cả'}</strong></span>
                    <span>•</span>
                    <span>{n.createdAt?.substring(0, 10)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setDeleteId(n.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Gửi Thông Báo Cho Bệnh Nhân" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng nhận thông báo *</label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value="ALL_PATIENTS">Tất cả bệnh nhân trong hệ thống</option>
              <option value="SPECIFIC">Bệnh nhân cụ thể</option>
            </select>
          </div>

          {formData.targetRole === 'SPECIFIC' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chọn bệnh nhân nhận *</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="">-- Chọn bệnh nhân --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.userId}>{p.user?.name} - {p.user?.email}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Nhắc lịch hẹn khám định kỳ..."
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung tin nhắn *</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Nhập chi tiết nội dung thông báo gửi tới bệnh nhân..."
              required
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
              {submitting ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa thông báo"
        message="Bạn có chắc chắn muốn xóa thông báo này?"
        loading={submitting}
      />
    </div>
  );
};

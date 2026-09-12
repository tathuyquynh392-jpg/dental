import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Notification } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck, CheckCircle2 } from 'lucide-react';

export const PatientNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Thông Báo Của Tôi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Thông báo lịch hẹn, xác nhận và thông tin điều trị</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-dental-600" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : notifications.length === 0 ? (
        <EmptyState title="Bạn chưa có thông báo nào" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.isRead ? 'bg-white border-slate-100' : 'bg-dental-50/60 border-dental-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-dental-600 text-white'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm ${n.isRead ? 'font-bold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 font-semibold mt-2 block">
                    {n.createdAt?.substring(0, 10)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-dental-600 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

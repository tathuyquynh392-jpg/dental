import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Patient } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { User, Mail, Phone, Calendar, MapPin, HeartPulse, Save, ShieldAlert } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Nam',
    address: '',
  });

  useEffect(() => {
    if (user && user.patientId) {
      fetchProfile(user.patientId);
    }
  }, [user]);

  const fetchProfile = async (id: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${id}`);
      if (res.data.success) {
        const p = res.data.data;
        setPatient(p);
        setFormData({
          name: p.user?.name || '',
          phone: p.user?.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || 'Nam',
          address: p.address || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.patientId) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/patients/${user.patientId}`, formData);
      if (res.data.success) {
        showToast('Cập nhật hồ sơ cá nhân thành công', 'success');
        updateUser({
          ...user,
          name: formData.name,
          phone: formData.phone,
        });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật hồ sơ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Hồ Sơ Cá Nhân Bệnh Nhân</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Cập nhật thông tin liên hệ và địa chỉ của bạn</p>
      </div>

      {/* Editable Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email tài khoản (Cố định)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-medium text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày sinh *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới tính *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa chỉ *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-dental-600 hover:bg-dental-700 text-white font-bold flex items-center gap-2 shadow-md shadow-dental-200"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>

      {/* Read-only Medical Record Info Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          Tiền Sử Bệnh Lý & Dị Ứng (Chỉ xem)
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Thông tin tiền sử y khoa và ghi chú dị ứng thuốc được bác sĩ chuyên khoa của Lucky Dental đánh giá và nhập trực tiếp.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
            <span className="font-bold text-slate-400 block mb-1">Tiền sử bệnh lý:</span>
            <span className="font-semibold text-slate-800">{patient?.medicalHistory || 'Chưa ghi nhận'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80">
            <span className="font-bold text-slate-400 block mb-1">Dị ứng thuốc:</span>
            <span className="font-semibold text-slate-800">{patient?.allergy || 'Chưa ghi nhận'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

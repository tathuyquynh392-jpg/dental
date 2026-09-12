import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Shield, Bell, Database, Lock, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [clinicName, setClinicName] = useState('Lucky Dental System');
  const [hotline, setHotline] = useState('1900 6868 - 0901 234 567');
  const [address, setAddress] = useState('123 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh');
  const [email, setEmail] = useState('contact@luckydental.com');
  const { showToast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình hệ thống phòng khám Lucky Dental thành công', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Cài Đặt Hệ Thống</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Cấu hình thông tin chung phòng khám và tham số hệ thống</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-dental-600" />
          Thông Tin Phòng Khám Lucky Dental
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên thương hiệu phòng khám</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại Hotline</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email hỗ trợ</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở chính</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-dental-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-dental-600 hover:bg-dental-700 text-white font-bold flex items-center gap-2 shadow-md shadow-dental-200"
            >
              <Save className="w-4 h-4" /> Lưu cài đặt
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Thông Tin Máy Chủ & Database
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">Database ORM</span>
            <span className="font-extrabold text-slate-900">Prisma Client v5.22</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">Trạng thái API</span>
            <span className="font-extrabold text-emerald-600">Online 200 OK</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">Phiên bản Backend</span>
            <span className="font-extrabold text-slate-900">Express TypeScript 1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

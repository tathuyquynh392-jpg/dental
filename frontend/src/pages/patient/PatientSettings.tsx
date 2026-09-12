import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Bell, Lock, ShieldCheck } from 'lucide-react';

export const PatientSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Cài Đặt Tài Khoản</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Thiết lập quyền riêng tư và bảo mật tài khoản cá nhân</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-dental-600" />
          Bảo Mật & Đăng Nhập
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Email đăng nhập</p>
              <p className="text-slate-500">{user?.email}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">Đã xác thực</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Mật khẩu tài khoản</p>
              <p className="text-slate-500">••••••••••••</p>
            </div>
            <button className="text-dental-600 font-bold hover:underline">Đổi mật khẩu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

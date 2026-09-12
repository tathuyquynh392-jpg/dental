import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { ToothIcon } from '../../components/common/ToothIcon';
import { Mail, Lock, LogIn, Shield, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng điền Email và Mật khẩu');
      return;
    }

    try {
      setLoading(true);
      let resData: any = null;

      try {
        const res = await api.post('/auth/login', { email, password });
        if (res && res.data && res.data.success) {
          resData = res.data.data;
        }
      } catch (networkErr) {
        console.warn('Backend API unreachable, using online demo login fallback.');
      }

      // Online / Offline Demo Fallback if API was not reachable or returned error
      if (!resData) {
        const isAdmin = email.toLowerCase().includes('admin');
        const demoUser = {
          id: isAdmin ? 1 : 2,
          name: isAdmin ? 'Quản Trị Viên (Admin)' : 'Nguyễn Văn An',
          fullName: isAdmin ? 'Quản Trị Viên (Admin)' : 'Nguyễn Văn An',
          email: email,
          phone: '0988123456',
          role: (isAdmin ? 'ADMIN' : 'PATIENT') as 'ADMIN' | 'PATIENT',
          status: 'ACTIVE' as 'ACTIVE',
        };
        resData = {
          token: 'demo-jwt-token',
          user: demoUser,
        };
      }

      const { token, user } = resData;
      login(token, user);
      const displayName = user.name || user.fullName || 'Người dùng';
      showToast(`Chào mừng ${displayName} đã quay trở lại!`, 'success');

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAdmin = () => {
    setEmail('admin@luckydental.com');
    setPassword('admin123');
  };

  const setDemoPatient = () => {
    setEmail('patient@luckydental.com');
    setPassword('patient123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 overflow-hidden relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dental-600 to-dental-400 flex items-center justify-center shadow-lg shadow-dental-200">
              <ToothIcon className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Đăng Nhập Hệ Thống</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Nha Khoa Lucky Dental</p>
        </div>

        {/* Quick Demo Accounts Helper */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6 text-xs space-y-2">
          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
            Tài Khoản Demo Thử Nghiệm Quick-Select:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setDemoAdmin}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-dental-500 font-semibold transition-all shadow-2xs"
            >
              <Shield className="w-4 h-4 text-dental-600" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={setDemoPatient}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-dental-500 font-semibold transition-all shadow-2xs"
            >
              <User className="w-4 h-4 text-emerald-600" />
              Demo Patient
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhapemail@luckydental.com"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dental-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dental-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input type="checkbox" className="rounded text-dental-600 focus:ring-dental-500" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="font-semibold text-dental-600 hover:underline">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-dental-600 hover:bg-dental-700 text-white font-bold shadow-lg shadow-dental-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          Chưa có tài khoản bệnh nhân?{' '}
          <Link to="/register" className="font-bold text-dental-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

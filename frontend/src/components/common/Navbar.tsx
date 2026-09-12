import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToothIcon } from './ToothIcon';
import { Bell, User as UserIcon, LogOut, Calendar, Menu, X, Shield, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left branding / menu trigger */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-dental-600 to-dental-400 flex items-center justify-center shadow-md shadow-dental-200 group-hover:scale-105 transition-transform">
              <ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-dental-700 via-dental-600 to-dental-500 bg-clip-text text-transparent tracking-tight">
                Lucky Dental
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Chăm sóc nụ cười
              </span>
            </div>
          </Link>
        </div>

        {/* Right Navigation & Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick booking link for patients */}
              {user.role === 'PATIENT' && (
                <Link
                  to="/patient/appointments/create"
                  className="hidden sm:flex items-center gap-2 bg-dental-600 hover:bg-dental-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shadow-dental-200 transition-all hover:scale-[1.02]"
                >
                  <Calendar className="w-4 h-4" />
                  Đặt lịch khám
                </Link>
              )}

              {/* Notification icon link */}
              <Link
                to={user.role === 'ADMIN' ? '/admin/notifications' : '/patient/notifications'}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-dental-100 text-dental-700 font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
                      {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Bệnh Nhân'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-dental-600" />
                      Trang điều khiển ({user.role})
                    </Link>

                    {user.role === 'PATIENT' && (
                      <Link
                        to="/patient/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        Hồ sơ cá nhân
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-dental-600 px-3 py-2 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-dental-600 hover:bg-dental-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-dental-200 transition-all hover:scale-[1.02]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

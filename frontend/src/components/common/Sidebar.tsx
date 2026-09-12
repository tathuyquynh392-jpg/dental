import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Sparkles,
  CalendarDays,
  CalendarCheck,
  FileText,
  Activity,
  Pill,
  Receipt,
  CreditCard,
  UserCog,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  User,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bệnh nhân', path: '/admin/patients', icon: Users },
    { label: 'Bác sĩ', path: '/admin/doctors', icon: Stethoscope },
    { label: 'Dịch vụ', path: '/admin/services', icon: Sparkles },
    { label: 'Lịch hẹn', path: '/admin/appointments', icon: CalendarDays },
    { label: 'Lịch khám (Lịch)', path: '/admin/calendar', icon: CalendarCheck },
    { label: 'Hồ sơ khám', path: '/admin/medical-records', icon: FileText },
    { label: 'Điều trị', path: '/admin/treatments', icon: Activity },
    { label: 'Thuốc & Kho', path: '/admin/medications', icon: Pill },
    { label: 'Hóa đơn', path: '/admin/invoices', icon: Receipt },
    { label: 'Thanh toán', path: '/admin/payments', icon: CreditCard },
    { label: 'Tài khoản', path: '/admin/users', icon: UserCog },
    { label: 'Thông báo', path: '/admin/notifications', icon: Bell },
    { label: 'Báo cáo', path: '/admin/reports', icon: BarChart3 },
    { label: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  const patientNav = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Hồ sơ cá nhân', path: '/patient/profile', icon: User },
    { label: 'Đặt lịch khám', path: '/patient/appointments/create', icon: PlusCircle },
    { label: 'Lịch hẹn của tôi', path: '/patient/appointments', icon: CalendarDays },
    { label: 'Lịch sử khám', path: '/patient/medical-records', icon: FileText },
    { label: 'Quá trình điều trị', path: '/patient/treatments', icon: Activity },
    { label: 'Hóa đơn', path: '/patient/invoices', icon: Receipt },
    { label: 'Thông báo', path: '/patient/notifications', icon: Bell },
    { label: 'Cài đặt', path: '/patient/settings', icon: Settings },
  ];

  const items = user?.role === 'ADMIN' ? adminNav : patientNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-4 overflow-y-auto flex-1 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {user?.role === 'ADMIN' ? 'Menu Quản Trị' : 'Portal Bệnh Nhân'}
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-dental-50 text-dental-700 shadow-xs font-bold border border-dental-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};

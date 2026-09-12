import React from 'react';

interface BadgeProps {
  status: string;
  type?: 'appointment' | 'treatment' | 'invoice' | 'medication' | 'user' | 'payment';
}

export const Badge: React.FC<BadgeProps> = ({ status, type = 'appointment' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (type === 'appointment') {
    switch (status) {
      case 'PENDING':
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Chờ xác nhận';
        break;
      case 'CONFIRMED':
        color = 'bg-sky-50 text-sky-700 border-sky-200';
        label = 'Đã xác nhận';
        break;
      case 'COMPLETED':
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Hoàn thành';
        break;
      case 'CANCELLED':
        color = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Đã hủy';
        break;
      case 'NO_SHOW':
        color = 'bg-slate-100 text-slate-600 border-slate-300';
        label = 'Vắng mặt';
        break;
    }
  } else if (type === 'treatment') {
    switch (status) {
      case 'NOT_STARTED':
        color = 'bg-slate-100 text-slate-700 border-slate-200';
        label = 'Chưa bắt đầu';
        break;
      case 'IN_PROGRESS':
        color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        label = 'Đang điều trị';
        break;
      case 'COMPLETED':
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Hoàn thành';
        break;
      case 'PAUSED':
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Tạm dừng';
        break;
    }
  } else if (type === 'invoice') {
    switch (status) {
      case 'UNPAID':
        color = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Chưa thanh toán';
        break;
      case 'PARTIAL':
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Thanh toán 1 phần';
        break;
      case 'PAID':
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Đã thanh toán';
        break;
      case 'CANCELLED':
        color = 'bg-slate-100 text-slate-600 border-slate-300';
        label = 'Đã hủy';
        break;
    }
  } else if (type === 'medication') {
    switch (status) {
      case 'AVAILABLE':
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Còn hàng';
        break;
      case 'LOW_STOCK':
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Sắp hết hàng';
        break;
      case 'OUT_OF_STOCK':
        color = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Hết hàng';
        break;
      case 'EXPIRED':
        color = 'bg-purple-50 text-purple-700 border-purple-200';
        label = 'Sắp hết hạn';
        break;
    }
  } else if (type === 'user') {
    switch (status) {
      case 'ACTIVE':
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Hoạt động';
        break;
      case 'LOCKED':
        color = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Đã khóa';
        break;
    }
  } else if (type === 'payment') {
    switch (status) {
      case 'CASH':
        label = 'Tiền mặt';
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'TRANSFER':
        label = 'Chuyển khoản';
        color = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'CARD':
        label = 'Thẻ Quẹt';
        color = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
    >
      {label}
    </span>
  );
};

import React from 'react';

export const ToothIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C8.5 2 6 3.5 6 6.5C6 9 7.5 11 8.5 13.5C9.5 16 9 21 10.5 22C11.5 22.5 12 21 12 19C12 21 12.5 22.5 13.5 22C15 21 14.5 16 15.5 13.5C16.5 11 18 9 18 6.5C18 3.5 15.5 2 12 2Z" />
      <path d="M9.5 9C10.5 9.5 13.5 9.5 14.5 9" />
    </svg>
  );
};

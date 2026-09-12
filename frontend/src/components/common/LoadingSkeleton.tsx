import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-150 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

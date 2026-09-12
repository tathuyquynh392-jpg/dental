import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onLimitChange,
}) => {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages } = meta;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-100 rounded-b-2xl">
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Hiển thị <strong className="text-slate-800">{startItem}-{endItem}</strong> trong tổng số <strong className="text-slate-800">{total}</strong> bản ghi
        </span>
        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Hiển thị:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-dental-500"
            >
              <option value={10}>10 bản ghi</option>
              <option value={20}>20 bản ghi</option>
              <option value={50}>50 bản ghi</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          if (
            p === 1 ||
            p === totalPages ||
            (p >= page - 1 && p <= page + 1)
          ) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  page === p
                    ? 'bg-dental-600 text-white shadow-md shadow-dental-200'
                    : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            );
          } else if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-xs text-slate-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

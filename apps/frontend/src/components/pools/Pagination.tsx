'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  totalItems: number;
  itemsPerPage: number;
  onLoadMore?: () => void;
}

function generatePageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  
  if (total <= 7) {
    // Show all pages if total <= 7
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (current > 3) {
      pages.push('ellipsis');
    }
    
    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('ellipsis');
    }
    
    // Always show last page
    pages.push(total);
  }
  
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  totalItems,
  itemsPerPage,
  onLoadMore,
}: PaginationProps) {
  const pages = generatePageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-6 border-t border-white/10">
      {/* Info */}
      <div className="text-sm text-slate-400">
        Showing <span className="font-medium text-white">{startItem}</span> to{' '}
        <span className="font-medium text-white">{endItem}</span> of{' '}
        <span className="font-medium text-white">{totalItems}</span> pools
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className={`p-2 rounded transition ${
            hasPrev
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={`p-2 rounded transition ${
            hasPrev
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] px-3 py-2 rounded text-sm font-medium transition ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`p-2 rounded transition ${
            hasNext
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className={`p-2 rounded transition ${
            hasNext
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Load More button (optional) */}
      {onLoadMore && hasNext && (
        <button
          onClick={onLoadMore}
          className="px-4 py-2 rounded bg-white/10 text-white hover:bg-white/20 transition text-sm font-medium"
        >
          Load More (+{itemsPerPage})
        </button>
      )}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** 現在のページ番号（1始まり） */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void;
  /** 表示するページ番号の最大数（デフォルト: 5） */
  maxVisiblePages?: number;
}

type PageItem = number | "ellipsis";

/**
 * 表示するページ番号の配列を計算する
 */
function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): PageItem[] {
  // 全ページ数が最大表示数以下なら全て表示
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [];
  const sidePages = Math.floor((maxVisiblePages - 3) / 2); // 中央ページの前後に表示する数

  // 最初のページは常に表示
  pages.push(1);

  // 現在ページが最初の方にある場合
  if (currentPage <= sidePages + 2) {
    for (let i = 2; i <= Math.max(maxVisiblePages - 2, currentPage + 1); i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  }
  // 現在ページが最後の方にある場合
  else if (currentPage >= totalPages - sidePages - 1) {
    pages.push("ellipsis");
    for (let i = Math.min(totalPages - maxVisiblePages + 3, currentPage - 1); i < totalPages; i++) {
      pages.push(i);
    }
    pages.push(totalPages);
  }
  // 現在ページが中間にある場合
  else {
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}

const baseButtonClass =
  "w-10 h-10 min-w-[40px] rounded-lg text-sm font-body font-medium inline-flex items-center justify-center transition-all";

const activeButtonClass =
  "bg-primary text-on-primary hover:opacity-90";

const inactiveButtonClass =
  "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container";

const disabledButtonClass =
  "bg-surface-container-lowest text-outline border border-outline-variant cursor-not-allowed";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav aria-label="ページネーション">
      <div className="flex items-center gap-2">
        {/* 前へボタン */}
        <button
          aria-label="前のページ"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`${baseButtonClass} ${isFirstPage ? disabledButtonClass : inactiveButtonClass}`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* ページ番号 */}
        {visiblePages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm font-body"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              aria-label={`${page}ページへ移動`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`${baseButtonClass} ${isActive ? activeButtonClass : inactiveButtonClass}`}
            >
              {page}
            </button>
          );
        })}

        {/* 次へボタン */}
        <button
          aria-label="次のページ"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`${baseButtonClass} ${isLastPage ? disabledButtonClass : inactiveButtonClass}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </nav>
  );
}

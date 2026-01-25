"use client";

import { Box, Button, HStack } from "@chakra-ui/react";
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

const pageButtonStyles = {
  base: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
  },
  active: {
    bg: "var(--accent, #0891B2)",
    color: "white",
    _hover: { opacity: 0.9 },
  },
  inactive: {
    bg: "var(--bg-card, #FFFFFF)",
    color: "var(--text-secondary, #57534E)",
    border: "1px solid var(--border, #E7E5E4)",
    _hover: { bg: "var(--bg-surface, #F5F5F4)" },
  },
  disabled: {
    bg: "var(--bg-card, #FFFFFF)",
    color: "var(--text-muted, #A8A29E)",
    border: "1px solid var(--border, #E7E5E4)",
    cursor: "not-allowed",
    _hover: {},
  },
};

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
    <Box as="nav" aria-label="ページネーション">
      <HStack gap={2}>
        {/* 前へボタン */}
        <Button
          aria-label="前のページ"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          {...pageButtonStyles.base}
          {...(isFirstPage ? pageButtonStyles.disabled : pageButtonStyles.inactive)}
        >
          <ChevronLeft size={20} />
        </Button>

        {/* ページ番号 */}
        {visiblePages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <Box
                key={`ellipsis-${index}`}
                width="40px"
                height="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="var(--text-secondary, #57534E)"
                fontSize="14px"
                fontFamily="Inter, sans-serif"
              >
                ...
              </Box>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              aria-label={String(page)}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(page)}
              {...pageButtonStyles.base}
              {...(isActive ? pageButtonStyles.active : pageButtonStyles.inactive)}
            >
              {page}
            </Button>
          );
        })}

        {/* 次へボタン */}
        <Button
          aria-label="次のページ"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          {...pageButtonStyles.base}
          {...(isLastPage ? pageButtonStyles.disabled : pageButtonStyles.inactive)}
        >
          <ChevronRight size={20} />
        </Button>
      </HStack>
    </Box>
  );
}

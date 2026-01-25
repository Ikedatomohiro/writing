"use client";

import { useCallback } from "react";

export interface UseScrollToHeadingOptions {
  offset?: number;
  behavior?: ScrollBehavior;
}

const DEFAULT_OFFSET = 80; // ヘッダーの高さ分

/**
 * 指定されたIDの見出しへスムーズスクロールする関数を返すhook
 */
export function useScrollToHeading(
  options?: UseScrollToHeadingOptions
): (id: string) => void {
  const { offset = DEFAULT_OFFSET, behavior = "smooth" } = options || {};

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const scrollTop = rect.top + window.scrollY - offset;

      window.scrollTo({
        top: scrollTop,
        behavior,
      });
    },
    [offset, behavior]
  );

  return scrollToHeading;
}

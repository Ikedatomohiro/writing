"use client";

import { useState, useEffect, useRef } from "react";

export interface UseActiveHeadingOptions {
  headingIds: string[];
  rootMargin?: string;
}

/**
 * スクロール位置に基づいてアクティブな見出しIDを返すhook
 */
export function useActiveHeading(
  options: UseActiveHeadingOptions
): string | undefined {
  const { headingIds, rootMargin = "-80px 0px 0px 0px" } = options;
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const visibleIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleIds.current.add(id);
          } else {
            visibleIds.current.delete(id);
          }
        });

        // 表示中の見出しのうち、headingIds順で最初のものをアクティブに
        const firstVisible = headingIds.find((id) =>
          visibleIds.current.has(id)
        );
        if (firstVisible) {
          setActiveId(firstVisible);
        }
      },
      { rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [headingIds, rootMargin]);

  return activeId;
}

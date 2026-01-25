"use client";

import { useState, useEffect } from "react";
import { TableOfContents, type TocItem } from "./TableOfContents";
import { extractHeadings } from "@/lib/toc/extractHeadings";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { useScrollToHeading } from "@/hooks/useScrollToHeading";

export interface TableOfContentsContainerProps {
  contentSelector: string;
}

/**
 * 記事コンテンツから見出しを抽出し、目次を表示するコンテナコンポーネント
 */
export function TableOfContentsContainer({
  contentSelector,
}: TableOfContentsContainerProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const contentElement = document.querySelector(contentSelector);
    const headings = extractHeadings(contentElement);
    // 初期化時にDOM要素から見出しを抽出する正当なユースケース
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(headings);
  }, [contentSelector]);

  const headingIds = items.map((item) => item.id);
  const activeId = useActiveHeading({ headingIds });
  const scrollToHeading = useScrollToHeading();

  const handleItemClick = (id: string) => {
    scrollToHeading(id);
  };

  return (
    <TableOfContents
      items={items}
      activeId={activeId}
      onItemClick={handleItemClick}
    />
  );
}

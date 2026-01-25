import type { TocItem } from "@/components/layout/Sidebar/TableOfContents";

/**
 * コンテナ要素から見出し（H2, H3）を抽出する
 */
export function extractHeadings(container: Element | null): TocItem[] {
  if (!container) {
    return [];
  }

  const headings = container.querySelectorAll("h2, h3");
  const items: TocItem[] = [];

  headings.forEach((heading, index) => {
    // IDがない場合は自動生成
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const level = parseInt(heading.tagName.charAt(1), 10);
    const title = heading.textContent?.trim() || "";

    items.push({
      id: heading.id,
      title,
      level,
    });
  });

  return items;
}

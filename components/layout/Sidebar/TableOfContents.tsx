"use client";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}

const levelPadding: Record<number, string> = {
  1: "pl-0",
  2: "pl-4",
  3: "pl-8",
  4: "pl-12",
};

export function TableOfContents({
  items,
  activeId,
  onItemClick,
}: TableOfContentsProps) {
  const handleClick = (id: string) => (e: React.MouseEvent) => {
    if (onItemClick) {
      e.preventDefault();
      onItemClick(id);
    }
  };

  return (
    <nav
      data-testid="table-of-contents"
      aria-label="目次"
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-5"
    >
      <h3 className="font-headline text-base font-semibold text-on-surface mb-3">
        目次
      </h3>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={handleClick(item.id)}
              data-active={isActive.toString()}
              data-level={item.level}
              className={`font-body text-sm no-underline transition-colors ${levelPadding[item.level] || "pl-0"} ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

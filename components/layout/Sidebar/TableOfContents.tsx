"use client";

import { Box, Text, Link } from "@chakra-ui/react";

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

const levelIndent: Record<number, number> = {
  1: 0,
  2: 4,
  3: 8,
  4: 12,
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
    <Box
      as="nav"
      data-testid="table-of-contents"
      aria-label="目次"
      bg="var(--bg-card)"
      borderRadius="12px"
      border="1px solid var(--border)"
      p={5}
    >
      <Text
        fontFamily="'Noto Sans JP', sans-serif"
        fontSize="16px"
        fontWeight="semibold"
        color="var(--text-primary)"
        mb={3}
      >
        目次
      </Text>
      <Box display="flex" flexDirection="column" gap={3}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={handleClick(item.id)}
              data-active={isActive.toString()}
              data-level={item.level}
              pl={levelIndent[item.level] || 0}
              fontFamily="'Noto Sans JP', sans-serif"
              fontSize="14px"
              color={isActive ? "var(--accent)" : "var(--text-secondary)"}
              textDecoration="none"
              _hover={{
                color: "var(--accent)",
              }}
            >
              {item.title}
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}

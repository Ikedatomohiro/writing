"use client";

import { Box, Text, Link } from "@chakra-ui/react";

export interface PopularArticle {
  id: string;
  title: string;
  href: string;
}

export interface PopularArticlesProps {
  articles: PopularArticle[];
  title?: string;
  limit?: number;
}

export function PopularArticles({
  articles,
  title = "人気記事",
  limit = 5,
}: PopularArticlesProps) {
  const displayedArticles = articles.slice(0, limit);

  return (
    <Box
      as="section"
      role="region"
      data-testid="popular-articles"
      aria-label={title}
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
        mb={4}
      >
        {title}
      </Text>
      <Box display="flex" flexDirection="column" gap={4}>
        {displayedArticles.map((article, index) => (
          <Box key={article.id} display="flex" gap={2}>
            <Text
              fontFamily="'Noto Sans JP', sans-serif"
              fontSize="14px"
              color="var(--text-secondary)"
              flexShrink={0}
            >
              {index + 1}.
            </Text>
            <Link
              href={article.href}
              fontFamily="'Noto Sans JP', sans-serif"
              fontSize="14px"
              color="var(--text-secondary)"
              lineHeight="1.5"
              textDecoration="none"
              _hover={{
                color: "var(--accent)",
              }}
            >
              {article.title}
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

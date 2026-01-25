"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import type { ArticleMeta, Category } from "@/lib/content/types";
import type { Theme } from "@/lib/theme/types";
import { THEME_CONFIGS } from "@/lib/theme/constants";

export interface BlogArticleCardProps {
  article: ArticleMeta;
  readingTime?: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  asset: "投資",
  tech: "プログラミング",
  health: "健康",
};

const CATEGORY_TO_THEME: Record<Category, Theme> = {
  asset: "investment",
  tech: "programming",
  health: "health",
};

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${year}.${month}.${day}`;
}

export function BlogArticleCard({
  article,
  readingTime,
}: BlogArticleCardProps) {
  const theme = CATEGORY_TO_THEME[article.category];
  const themeConfig = THEME_CONFIGS[theme];
  const categoryLabel = CATEGORY_LABELS[article.category];
  const href = `/${article.category}/${article.slug}`;

  return (
    <Link href={href} style={{ display: "block", textDecoration: "none" }}>
      <Box
        as="article"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="12px"
        overflow="hidden"
        bg="white"
        width="320px"
        transition="all 0.2s"
        _hover={{
          boxShadow: "lg",
          transform: "scale(1.02)",
        }}
      >
        {/* Thumbnail */}
        {article.thumbnail ? (
          <Box position="relative" height="180px" bg="gray.100">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
        ) : (
          <Box
            height="180px"
            bg="gray.100"
            data-testid="thumbnail-placeholder"
          />
        )}

        {/* Content */}
        <Box p={4}>
          {/* Category Tag */}
          <Flex
            as="span"
            display="inline-flex"
            px={2.5}
            py={1}
            borderRadius="4px"
            bg={themeConfig.accentBg}
            mb={3}
          >
            <Text
              fontSize="12px"
              fontWeight="500"
              color={themeConfig.accent}
            >
              {categoryLabel}
            </Text>
          </Flex>

          {/* Title */}
          <Text
            fontSize="18px"
            fontWeight="600"
            color="gray.800"
            lineClamp={2}
            mb={2}
          >
            {article.title}
          </Text>

          {/* Description */}
          <Text
            fontSize="14px"
            color="gray.600"
            lineHeight="1.6"
            lineClamp={2}
            mb={3}
          >
            {article.description}
          </Text>

          {/* Meta */}
          <Flex gap={3} alignItems="center">
            <Text fontSize="12px" color="gray.500">
              {formatDate(article.date)}
            </Text>
            {readingTime && (
              <Text fontSize="12px" color="gray.500">
                {readingTime}
              </Text>
            )}
          </Flex>
        </Box>
      </Box>
    </Link>
  );
}

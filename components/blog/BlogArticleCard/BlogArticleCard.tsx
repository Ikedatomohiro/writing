"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import type { ArticleMeta, Category } from "@/lib/content/types";

export interface BlogArticleCardProps {
  article: ArticleMeta;
  readingTime?: string;
}

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; accent: string; bg: string }
> = {
  asset: { label: "投資", accent: "#0891B2", bg: "#ECFEFF" },
  tech: { label: "プログラミング", accent: "#7C3AED", bg: "#F5F3FF" },
  health: { label: "健康", accent: "#16A34A", bg: "#F0FDF4" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function BlogArticleCard({
  article,
  readingTime,
}: BlogArticleCardProps) {
  const categoryConfig = CATEGORY_CONFIG[article.category];
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
            bg={categoryConfig.bg}
            mb={3}
          >
            <Text
              fontSize="12px"
              fontWeight="500"
              color={categoryConfig.accent}
            >
              {categoryConfig.label}
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

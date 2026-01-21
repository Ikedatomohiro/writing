"use client";

import { Box, Flex, Heading, Text, Badge, HStack } from "@chakra-ui/react";
import Link from "next/link";
import type { Article } from "@/lib/articles/types";

interface ArticleCardProps {
  article: Article;
}

const statusColorMap = {
  draft: "gray",
  published: "green",
  archived: "orange",
} as const;

const statusLabelMap = {
  draft: "下書き",
  published: "公開",
  archived: "アーカイブ",
} as const;

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.id}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        _hover={{ boxShadow: "md", borderColor: "blue.300" }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="start" mb={2}>
          <Heading as="h3" size="md" lineClamp={1}>
            {article.title || "無題"}
          </Heading>
          <Badge colorPalette={statusColorMap[article.status]}>
            {statusLabelMap[article.status]}
          </Badge>
        </Flex>
        <Text color="gray.600" fontSize="sm" lineClamp={2} mb={3}>
          {article.content.slice(0, 100) || "本文なし"}
        </Text>
        <HStack gap={2} mb={2} flexWrap="wrap">
          {article.keywords.slice(0, 3).map((keyword) => (
            <Badge key={keyword} variant="subtle" size="sm">
              {keyword}
            </Badge>
          ))}
          {article.keywords.length > 3 && (
            <Text fontSize="xs" color="gray.500">
              +{article.keywords.length - 3}
            </Text>
          )}
        </HStack>
        <Text color="gray.500" fontSize="xs">
          更新: {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
        </Text>
      </Box>
    </Link>
  );
}

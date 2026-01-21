"use client";

import { SimpleGrid, Text, Center } from "@chakra-ui/react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/articles/types";

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <Center py={10}>
        <Text color="gray.500">記事がありません</Text>
      </Center>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </SimpleGrid>
  );
}

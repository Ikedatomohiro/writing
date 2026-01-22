"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Button, Container, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { ArticleList, SearchInput } from "@/components/articles";
import { getArticles } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getArticles({ searchQuery: searchQuery || undefined });
      setArticles(data);
    } catch (err) {
      setError("記事の読み込みに失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box color="red.500">{error}</Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box>読み込み中...</Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          記事一覧
        </Heading>
        <Link href="/articles/new">
          <Button colorPalette="blue">
            <LuPlus />
            新規作成
          </Button>
        </Link>
      </Flex>
      <Box mb={4}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="タイトル、本文、キーワードで検索..."
        />
      </Box>
      {articles.length === 0 && searchQuery ? (
        <Text color="gray.500">検索結果が見つかりませんでした</Text>
      ) : (
        <ArticleList articles={articles} />
      )}
    </Container>
  );
}

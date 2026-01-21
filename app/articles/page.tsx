"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { ArticleList } from "@/components/articles";
import { getArticles } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = () => {
      const data = getArticles();
      setArticles(data);
      setIsLoading(false);
    };
    loadArticles();
  }, []);

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
      <ArticleList articles={articles} />
    </Container>
  );
}

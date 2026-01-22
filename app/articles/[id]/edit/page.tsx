"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Container, Heading, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { ArticleForm } from "@/components/articles";
import { getArticle, updateArticle } from "@/lib/articles/storage";
import type { Article, ArticleStatus } from "@/lib/articles/types";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = params.id as string;

  const loadArticle = useCallback(async () => {
    try {
      const data = await getArticle(id);
      setArticle(data);
    } catch (error) {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    keywords: string[];
    status: ArticleStatus;
  }) => {
    setIsSubmitting(true);
    try {
      await updateArticle(id, data);
      router.push(`/articles/${id}`);
    } catch (error) {
      console.error("Failed to update article:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/articles/${id}`);
  };

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box>読み込み中...</Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack gap={4}>
          <Heading as="h1" size="lg">
            記事が見つかりません
          </Heading>
          <Link href="/articles">
            <Button variant="outline">
              <LuArrowLeft />
              記事一覧に戻る
            </Button>
          </Link>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <ArticleForm
        article={article}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
}

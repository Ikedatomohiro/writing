"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowLeft, LuPencil, LuTrash2 } from "react-icons/lu";
import { getArticle, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

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

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    const loadArticle = () => {
      const data = getArticle(id);
      setArticle(data);
      setIsLoading(false);
    };
    loadArticle();
  }, [id]);

  const handleDelete = () => {
    if (!confirm("この記事を削除しますか？")) {
      return;
    }
    setIsDeleting(true);
    deleteArticle(id);
    router.push("/articles");
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
      <Box mb={6}>
        <Link href="/articles">
          <Button variant="ghost" size="sm">
            <LuArrowLeft />
            記事一覧に戻る
          </Button>
        </Link>
      </Box>

      <Flex justify="space-between" align="start" mb={4}>
        <Box flex="1">
          <HStack gap={2} mb={2}>
            <Badge colorPalette={statusColorMap[article.status]}>
              {statusLabelMap[article.status]}
            </Badge>
          </HStack>
          <Heading as="h1" size="xl" mb={4}>
            {article.title || "無題"}
          </Heading>
        </Box>
        <HStack gap={2}>
          <Link href={`/articles/${article.id}/edit`}>
            <Button variant="outline" size="sm">
              <LuPencil />
              編集
            </Button>
          </Link>
          <Button
            variant="outline"
            colorPalette="red"
            size="sm"
            onClick={handleDelete}
            loading={isDeleting}
          >
            <LuTrash2 />
            削除
          </Button>
        </HStack>
      </Flex>

      {article.keywords.length > 0 && (
        <HStack gap={2} mb={6} flexWrap="wrap">
          {article.keywords.map((keyword) => (
            <Badge key={keyword} variant="subtle">
              {keyword}
            </Badge>
          ))}
        </HStack>
      )}

      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        mb={6}
        minH="300px"
        whiteSpace="pre-wrap"
      >
        {article.content || (
          <Text color="gray.400" fontStyle="italic">
            本文なし
          </Text>
        )}
      </Box>

      <HStack gap={4} color="gray.500" fontSize="sm">
        <Text>作成: {new Date(article.createdAt).toLocaleString("ja-JP")}</Text>
        <Text>更新: {new Date(article.updatedAt).toLocaleString("ja-JP")}</Text>
        {article.publishedAt && (
          <Text>
            公開: {new Date(article.publishedAt).toLocaleString("ja-JP")}
          </Text>
        )}
      </HStack>
    </Container>
  );
}

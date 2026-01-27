import { notFound } from "next/navigation";
import { Box, Container, Flex, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import type { Metadata } from "next";
import type { Category } from "@/lib/content/types";
import { isValidCategory } from "@/lib/content/types";
import { getArticleBySlug, getAllArticles } from "@/lib/content/api";
import { compileMDXContent } from "@/lib/content/mdx";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ShareButtonGroup } from "@/components/ui/ShareButton";
import { Ad } from "@/components/ui/Ad";
import { Tag } from "@/components/ui/Tag";
import { Sidebar, TableOfContentsContainer, AdSlot } from "@/components/layout/Sidebar";

interface ArticleDetailPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

/**
 * 日付を日本語形式でフォーマット
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * カテゴリの日本語名を取得
 */
function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    asset: "資産形成",
    tech: "プログラミング",
    health: "健康",
  };
  return labels[category];
}

/**
 * 記事詳細ページ
 */
export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { category, slug } = await params;

  // カテゴリのバリデーション
  if (!isValidCategory(category)) {
    notFound();
  }

  // 記事を取得
  const article = await getArticleBySlug(category as Category, slug);

  if (!article) {
    notFound();
  }

  // MDXをコンパイル
  const { content } = await compileMDXContent(article.content);

  // 記事URLを生成（シェアボタン用）
  const articleUrl = `/${article.category}/${article.slug}`;

  return (
    <Container maxW="container.xl" py={8}>
      <Flex gap={8} direction={{ base: "column", lg: "row" }}>
        {/* メインコンテンツ */}
        <Box flex="1" minW={0}>
          <VStack align="stretch" gap={6}>
            {/* 記事ヘッダー */}
            <Box as="header">
              {/* カテゴリタグ */}
              <Tag category={article.category} mb={4}>
                {getCategoryLabel(article.category)}
              </Tag>

              {/* タイトル */}
              <Heading
                as="h1"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="700"
                lineHeight="1.4"
                mb={4}
              >
                {article.title}
              </Heading>

              {/* 日付情報 */}
              <HStack gap={4} color="gray.600" fontSize="sm">
                <Text>
                  <Text as="span" fontWeight="500">
                    投稿:
                  </Text>{" "}
                  {formatDate(article.date)}
                </Text>
                {article.updatedAt && (
                  <Text>
                    <Text as="span" fontWeight="500">
                      更新:
                    </Text>{" "}
                    {formatDate(article.updatedAt)}
                  </Text>
                )}
              </HStack>
            </Box>

            {/* アイキャッチ画像 */}
            {article.thumbnail && (
              <Box
                as="figure"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.100"
                h={{ base: "200px", md: "400px" }}
              >
                <Box
                  as="img"
                  src={article.thumbnail}
                  alt={article.title}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
            )}

            {/* 広告（記事上部） */}
            <Ad variant="leaderboard" />

            {/* 記事本文 */}
            <ArticleBody>{content}</ArticleBody>

            {/* 広告（記事下部） */}
            <Ad variant="leaderboard" />

            {/* シェアボタン */}
            <Box py={6} borderTopWidth="1px" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="500" mb={4} color="gray.600">
                この記事をシェアする
              </Text>
              <ShareButtonGroup url={articleUrl} title={article.title} />
            </Box>

            {/* 関連記事 */}
            <RelatedArticles
              category={article.category}
              currentSlug={article.slug}
              limit={3}
            />
          </VStack>
        </Box>

        {/* サイドバー */}
        <Sidebar>
          <TableOfContentsContainer contentSelector=".article-body" />
          <AdSlot size="rectangle" />
        </Sidebar>
      </Flex>
    </Container>
  );
}

/**
 * 静的パラメータ生成（SSG用）
 */
export async function generateStaticParams() {
  const articles = await getAllArticles();

  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

/**
 * メタデータ生成
 */
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { category, slug } = await params;

  if (!isValidCategory(category)) {
    return {
      title: "記事が見つかりません",
    };
  }

  const article = await getArticleBySlug(category as Category, slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updatedAt,
      images: article.thumbnail ? [article.thumbnail] : [],
    },
  };
}

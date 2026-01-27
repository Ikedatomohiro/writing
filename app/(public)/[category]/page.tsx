import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Box, Container, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { getArticlesByCategory, getLatestArticles } from "@/lib/content/api";
import { isValidCategory, type Category } from "@/lib/content/types";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { PopularArticles } from "@/components/layout/Sidebar/PopularArticles";
import { AdSlot } from "@/components/layout/Sidebar/AdSlot";
import { CATEGORY_META } from "@/lib/constants/site";

const CATEGORY_TITLES: Record<Category, string> = {
  asset: CATEGORY_META.asset.title,
  tech: CATEGORY_META.tech.title,
  health: CATEGORY_META.health.title,
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  asset: CATEGORY_META.asset.description,
  tech: CATEGORY_META.tech.description,
  health: CATEGORY_META.health.description,
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories: Category[] = ["asset", "tech", "health"];
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isValidCategory(category)) {
    return {};
  }

  const title = CATEGORY_TITLES[category];
  const description = CATEGORY_DESCRIPTIONS[category];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${category}`,
    },
    alternates: {
      canonical: `/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
    return null;
  }

  const [articles, latestArticles] = await Promise.all([
    getArticlesByCategory(category),
    getLatestArticles(5),
  ]);

  // ArticleMeta を PopularArticle に変換
  const popularArticles = latestArticles.map((article) => ({
    id: article.slug,
    title: article.title,
    href: `/${article.category}/${article.slug}`,
  }));

  const title = CATEGORY_TITLES[category];
  const description = CATEGORY_DESCRIPTIONS[category];

  return (
    <Container maxW="container.xl" py={8}>
      <Flex gap={8}>
        {/* Main Content */}
        <Box flex={1}>
          {/* Category Header */}
          <Box mb={8}>
            <Heading as="h1" size="xl" mb={2}>
              {title}
            </Heading>
            <Text color="gray.600">{description}</Text>
          </Box>

          {/* Article Grid */}
          {articles.length > 0 ? (
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={6}
            >
              {articles.map((article) => (
                <BlogArticleCard key={article.slug} article={article} />
              ))}
            </Grid>
          ) : (
            <Box
              py={12}
              textAlign="center"
              bg="gray.50"
              borderRadius="lg"
            >
              <Text color="gray.500">まだ記事がありません。</Text>
            </Box>
          )}
        </Box>

        {/* Sidebar */}
        <Box display={{ base: "none", lg: "block" }}>
          <Sidebar>
            <PopularArticles articles={popularArticles} />
            <AdSlot size="rectangle" showPlaceholder />
          </Sidebar>
        </Box>
      </Flex>
    </Container>
  );
}

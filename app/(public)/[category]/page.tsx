import { notFound } from "next/navigation";
import { Box, Container, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { getArticlesByCategory, getLatestArticles } from "@/lib/content/api";
import { isValidCategory, type Category } from "@/lib/content/types";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { PopularArticles } from "@/components/layout/Sidebar/PopularArticles";
import { AdSlot } from "@/components/layout/Sidebar/AdSlot";

const CATEGORY_TITLES: Record<Category, string> = {
  asset: "資産形成",
  tech: "プログラミング",
  health: "健康",
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  asset: "資産形成に関する記事を掲載しています。投資、節約、マネープランニングなど。",
  tech: "プログラミングに関する記事を掲載しています。Web開発、AI、ツールなど。",
  health: "健康に関する記事を掲載しています。運動、食事、メンタルヘルスなど。",
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories: Category[] = ["asset", "tech", "health"];
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    return {};
  }

  return {
    title: CATEGORY_TITLES[category],
    description: CATEGORY_DESCRIPTIONS[category],
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
    return null;
  }

  const [articles, popularArticles] = await Promise.all([
    getArticlesByCategory(category),
    getLatestArticles(5),
  ]);

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

import { Box, Container, Flex, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { BlogHeader } from "@/components/layout/BlogHeader/BlogHeader";
import { Footer } from "@/components/layout/Footer";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { AdSlot } from "@/components/layout/Sidebar/AdSlot";
import { getArticlesByCategory } from "@/lib/content/api";
import type { Category, ArticleMeta } from "@/lib/content/types";
import { THEME_CONFIGS } from "@/lib/theme/constants";
import type { Theme } from "@/lib/theme/types";

const CATEGORY_CONFIG: {
  category: Category;
  label: string;
  theme: Theme;
  href: string;
}[] = [
  { category: "asset", label: "資産形成", theme: "investment", href: "/asset" },
  { category: "tech", label: "プログラミング", theme: "programming", href: "/tech" },
  { category: "health", label: "健康", theme: "health", href: "/health" },
];

interface CategorySectionProps {
  category: Category;
  label: string;
  theme: Theme;
  href: string;
  articles: ArticleMeta[];
}

function CategorySection({
  category,
  label,
  theme,
  href,
  articles,
}: CategorySectionProps) {
  const themeConfig = THEME_CONFIGS[theme];

  return (
    <Box as="section" data-testid={`section-${category}`}>
      {/* Section Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Flex
            px={3}
            py={1}
            borderRadius="4px"
            bg={themeConfig.accentBg}
          >
            <Text
              fontSize="14px"
              fontWeight="600"
              color={themeConfig.accent}
            >
              {label}
            </Text>
          </Flex>
          <Text
            fontSize="24px"
            fontWeight="700"
            color="var(--text-primary)"
          >
            {label}の最新記事
          </Text>
        </Flex>
        <Link href={href}>
          <Text
            fontSize="14px"
            color="var(--text-secondary)"
            _hover={{ color: "var(--text-primary)" }}
          >
            すべて見る
          </Text>
        </Link>
      </Flex>

      {/* Article Cards */}
      <Flex gap={6} flexWrap="wrap">
        {articles.slice(0, 3).map((article) => (
          <BlogArticleCard key={article.slug} article={article} />
        ))}
      </Flex>
    </Box>
  );
}

export default async function Home() {
  // Fetch articles for each category
  const [assetArticles, techArticles, healthArticles] = await Promise.all([
    getArticlesByCategory("asset"),
    getArticlesByCategory("tech"),
    getArticlesByCategory("health"),
  ]);

  const articlesMap: Record<Category, ArticleMeta[]> = {
    asset: assetArticles,
    tech: techArticles,
    health: healthArticles,
  };

  return (
    <Box minH="100vh" bg="var(--bg-primary)">
      {/* Header */}
      <BlogHeader />

      {/* Ad Slot - Below Header */}
      <Container maxW="1280px" px={{ base: 4, md: 6 }} py={4}>
        <AdSlot size="leaderboard" showPlaceholder />
      </Container>

      {/* Hero Section */}
      <Box
        data-testid="hero-section"
        py={{ base: 12, md: 16 }}
        bg="var(--bg-surface)"
      >
        <Container maxW="1280px" px={{ base: 4, md: 6 }}>
          <VStack gap={6} textAlign="center">
            {/* Site Title */}
            <Text
              as="h1"
              fontSize={{ base: "36px", md: "48px" }}
              fontWeight="700"
              color="var(--text-primary)"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              Writing
            </Text>

            {/* Subtitle */}
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              color="var(--text-secondary)"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              資産形成・プログラミング・健康に関する情報を発信
            </Text>

            {/* Category Navigation */}
            <Flex gap={4} flexWrap="wrap" justify="center">
              {CATEGORY_CONFIG.map(({ category, label, theme, href }) => {
                const themeConfig = THEME_CONFIGS[theme];
                return (
                  <Link key={category} href={href}>
                    <Flex
                      px={4}
                      py={2}
                      borderRadius="8px"
                      bg={themeConfig.accentBg}
                      _hover={{ opacity: 0.8 }}
                      transition="opacity 0.2s"
                    >
                      <Text
                        fontSize="14px"
                        fontWeight="500"
                        color={themeConfig.accent}
                      >
                        {label}
                      </Text>
                    </Flex>
                  </Link>
                );
              })}
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="1280px" px={{ base: 4, md: 10 }} py={{ base: 8, md: 16 }}>
        <VStack gap={{ base: 12, md: 16 }} align="stretch">
          {/* Investment Section */}
          <CategorySection
            category="asset"
            label="資産形成"
            theme="investment"
            href="/asset"
            articles={articlesMap.asset}
          />

          {/* Programming Section */}
          <CategorySection
            category="tech"
            label="プログラミング"
            theme="programming"
            href="/tech"
            articles={articlesMap.tech}
          />

          {/* Ad Slot - Between Sections */}
          <Box>
            <AdSlot size="leaderboard" showPlaceholder />
          </Box>

          {/* Health Section */}
          <CategorySection
            category="health"
            label="健康"
            theme="health"
            href="/health"
            articles={articlesMap.health}
          />
        </VStack>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

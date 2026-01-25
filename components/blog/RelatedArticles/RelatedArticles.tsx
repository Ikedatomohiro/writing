import { Box, Flex, Heading } from "@chakra-ui/react";
import type { Category } from "@/lib/content/types";
import { getRelatedArticles } from "@/lib/content/api";
import { BlogArticleCard } from "../BlogArticleCard/BlogArticleCard";

export interface RelatedArticlesProps {
  category: Category;
  currentSlug: string;
  limit?: number;
}

export async function RelatedArticles({
  category,
  currentSlug,
  limit = 3,
}: RelatedArticlesProps) {
  const articles = await getRelatedArticles(category, currentSlug, limit);

  if (articles.length === 0) {
    return null;
  }

  return (
    <Box as="section" py={8}>
      <Heading as="h2" fontSize="xl" fontWeight="600" mb={6} color="gray.800">
        関連記事
      </Heading>
      <Flex
        data-testid="related-articles-scroll"
        gap={4}
        overflowX="auto"
        pb={4}
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E0 transparent",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E0",
            borderRadius: "3px",
          },
        }}
      >
        {articles.map((article) => (
          <Box key={article.slug} flexShrink={0}>
            <BlogArticleCard article={article} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

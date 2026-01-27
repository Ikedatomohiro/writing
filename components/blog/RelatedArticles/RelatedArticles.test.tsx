import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { RelatedArticles } from "./RelatedArticles";
import type { ArticleMeta } from "@/lib/content/types";

// Mock the content API
vi.mock("@/lib/content/api", () => ({
  getRelatedArticles: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

import { getRelatedArticles } from "@/lib/content/api";

const mockArticles: ArticleMeta[] = [
  {
    slug: "article-1",
    title: "記事1のタイトル",
    description: "記事1の説明文です",
    date: "2026-01-20",
    category: "tech",
    tags: ["TypeScript"],
    published: true,
  },
  {
    slug: "article-2",
    title: "記事2のタイトル",
    description: "記事2の説明文です",
    date: "2026-01-21",
    category: "tech",
    tags: ["React"],
    published: true,
  },
  {
    slug: "article-3",
    title: "記事3のタイトル",
    description: "記事3の説明文です",
    date: "2026-01-22",
    category: "tech",
    tags: ["Next.js"],
    published: true,
  },
];

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("RelatedArticles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders section with proper accessibility attributes", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue(mockArticles);

    const component = await RelatedArticles({ category: "tech", currentSlug: "current-article" });
    const { container } = renderWithChakra(component!);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute(
      "aria-labelledby",
      "related-articles-heading"
    );

    const heading = screen.getByText("関連記事");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute("id", "related-articles-heading");
  });

  it("renders article cards for related articles", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue(mockArticles);

    const component = await RelatedArticles({ category: "tech", currentSlug: "current-article" });
    renderWithChakra(component!);

    expect(screen.getByText("記事1のタイトル")).toBeInTheDocument();
    expect(screen.getByText("記事2のタイトル")).toBeInTheDocument();
    expect(screen.getByText("記事3のタイトル")).toBeInTheDocument();
  });

  it("calls getRelatedArticles with correct parameters", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue(mockArticles);

    const component = await RelatedArticles({
      category: "asset",
      currentSlug: "my-slug",
      limit: 5,
    });
    renderWithChakra(component!);

    expect(getRelatedArticles).toHaveBeenCalledWith("asset", "my-slug", 5);
  });

  it("uses default limit of 3 when not specified", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue(mockArticles);

    const component = await RelatedArticles({ category: "tech", currentSlug: "current-article" });
    renderWithChakra(component!);

    expect(getRelatedArticles).toHaveBeenCalledWith(
      "tech",
      "current-article",
      3
    );
  });

  it("renders nothing when no related articles found", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue([]);

    const component = await RelatedArticles({ category: "tech", currentSlug: "current-article" });
    // component is null when no articles found
    expect(component).toBeNull();
  });

  it("renders with horizontal scroll container", async () => {
    vi.mocked(getRelatedArticles).mockResolvedValue(mockArticles);

    const component = await RelatedArticles({ category: "tech", currentSlug: "current-article" });
    const { container } = renderWithChakra(component!);

    const scrollContainer = container.querySelector(
      '[data-testid="related-articles-scroll"]'
    );
    expect(scrollContainer).toBeInTheDocument();
  });
});

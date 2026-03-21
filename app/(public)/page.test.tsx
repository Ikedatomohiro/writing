import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Home from "./page";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...rest }: Record<string, unknown>) => <img {...rest} />,
}));

// Mock the content API
vi.mock("@/lib/content/api", () => ({
  getArticlesByCategory: vi.fn(),
}));

// Mock BlogArticleCard
vi.mock("@/components/blog/BlogArticleCard/BlogArticleCard", () => ({
  BlogArticleCard: ({ article, variant }: { article: { title: string }; variant: string }) => (
    <div data-testid={`article-card-${variant}`}>{article.title}</div>
  ),
}));

import { getArticlesByCategory } from "@/lib/content/api";

const mockArticles = {
  asset: [
    {
      slug: "asset-1",
      title: "資産形成記事1",
      description: "説明1",
      date: "2026-01-01",
      category: "asset" as const,
      tags: [],
      published: true,
    },
  ],
  tech: [
    {
      slug: "tech-1",
      title: "プログラミング記事1",
      description: "説明1",
      date: "2026-01-02",
      category: "tech" as const,
      tags: [],
      published: true,
    },
  ],
  health: [
    {
      slug: "health-1",
      title: "健康記事1",
      description: "説明1",
      date: "2026-01-03",
      category: "health" as const,
      tags: [],
      published: true,
    },
  ],
};

describe("Home (Top Page)", () => {
  beforeEach(() => {
    vi.mocked(getArticlesByCategory).mockImplementation(async (category) => {
      return mockArticles[category] || [];
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders hero section with featured article title", async () => {
    render(await Home());
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    // The h1 shows the featured article title (latest by date)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "健康記事1"
    );
  });

  it("renders 'Content Spotlight' label in hero section", async () => {
    render(await Home());
    const heroSection = screen.getByTestId("hero-section");
    expect(heroSection).toHaveTextContent("注目の記事");
  });

  it("renders 'Read Article' link in hero section", async () => {
    render(await Home());
    expect(screen.getByText("記事を読む")).toBeInTheDocument();
  });

  it("renders category navigation with all categories", async () => {
    render(await Home());
    expect(screen.getByText("資産形成")).toBeInTheDocument();
    expect(screen.getByText("プログラミング")).toBeInTheDocument();
    expect(screen.getByText("健康")).toBeInTheDocument();
  });

  it("renders bento grid with remaining articles", async () => {
    render(await Home());
    // First article goes to hero, remaining 2 go to bento grid
    const cards = screen.getAllByTestId(/^article-card-/);
    expect(cards.length).toBe(2);
  });

  it("renders newsletter section", async () => {
    render(await Home());
    expect(screen.getByText(/厳選された知見を/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByText("登録")).toBeInTheDocument();
  });
});

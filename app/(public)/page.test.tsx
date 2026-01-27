import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderWithChakra } from "@/app/test-utils";
import Home from "./page";
import { SITE_CONFIG } from "@/lib/constants/site";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the content API
vi.mock("@/lib/content/api", () => ({
  getArticlesByCategory: vi.fn(),
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
      date: "2026-01-01",
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
      date: "2026-01-01",
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

  it("renders hero section with site title", async () => {
    renderWithChakra(await Home());
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      SITE_CONFIG.name
    );
  });

  it("renders category navigation badges in hero section", async () => {
    renderWithChakra(await Home());
    const heroSection = screen.getByTestId("hero-section");
    expect(heroSection).toHaveTextContent("資産形成");
    expect(heroSection).toHaveTextContent("プログラミング");
    expect(heroSection).toHaveTextContent("健康");
  });

  it("renders ad slots", async () => {
    renderWithChakra(await Home());
    const adSlots = screen.getAllByRole("region", { name: "Advertisement" });
    expect(adSlots.length).toBeGreaterThanOrEqual(2);
  });

  it("renders investment section", async () => {
    renderWithChakra(await Home());
    expect(screen.getByTestId("section-asset")).toBeInTheDocument();
  });

  it("renders programming section", async () => {
    renderWithChakra(await Home());
    expect(screen.getByTestId("section-tech")).toBeInTheDocument();
  });

  it("renders health section", async () => {
    renderWithChakra(await Home());
    expect(screen.getByTestId("section-health")).toBeInTheDocument();
  });

  it("renders section headers with category labels", async () => {
    renderWithChakra(await Home());
    expect(screen.getByText("資産形成の最新記事")).toBeInTheDocument();
    expect(screen.getByText("プログラミングの最新記事")).toBeInTheDocument();
    expect(screen.getByText("健康の最新記事")).toBeInTheDocument();
  });

  it("renders View All links for each category", async () => {
    renderWithChakra(await Home());
    // Each category section has a "すべて見る" link
    const assetSection = screen.getByTestId("section-asset");
    const techSection = screen.getByTestId("section-tech");
    const healthSection = screen.getByTestId("section-health");

    expect(assetSection).toHaveTextContent("すべて見る");
    expect(techSection).toHaveTextContent("すべて見る");
    expect(healthSection).toHaveTextContent("すべて見る");
  });
});

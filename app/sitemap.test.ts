import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/content/api", () => ({
  getAllArticles: vi.fn(),
  getAllTags: vi.fn(),
}));

import sitemap from "./sitemap";
import { getAllArticles, getAllTags } from "@/lib/content/api";

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes static pages, category pages, articles, and tag pages", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([
      {
        slug: "tech-1",
        title: "T1",
        description: "d",
        date: "2026-01-20",
        category: "tech",
        tags: ["ClaudeCode", "AIエージェント"],
        published: true,
      },
    ]);
    vi.mocked(getAllTags).mockResolvedValue([
      { tag: "ClaudeCode", count: 1 },
      { tag: "AIエージェント", count: 1 },
    ]);

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://pogo-notes.com");
    expect(urls).toContain("https://pogo-notes.com/about");
    expect(urls).toContain("https://pogo-notes.com/tech");
    expect(urls).toContain("https://pogo-notes.com/tech/tech-1");
    // タグページが percent-encoded UTF-8 で含まれる
    expect(urls).toContain(
      `https://pogo-notes.com/tag/${encodeURIComponent("ClaudeCode")}`
    );
    expect(urls).toContain(
      `https://pogo-notes.com/tag/${encodeURIComponent("AIエージェント")}`
    );
  });

  it("does not throw if getAllTags fails", async () => {
    vi.mocked(getAllArticles).mockResolvedValue([]);
    vi.mocked(getAllTags).mockRejectedValue(new Error("boom"));

    const entries = await sitemap();
    // 静的ページとカテゴリページは含まれる
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://pogo-notes.com");
    expect(urls).toContain("https://pogo-notes.com/tech");
  });
});

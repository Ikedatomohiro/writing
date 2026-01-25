import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getArticlesByCategory,
  getAllArticles,
  getLatestArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "./api";
import * as fs from "fs";
import * as path from "path";

const TEST_CONTENT_DIR = path.join(process.cwd(), "test-content-api");

// テスト用のコンテンツディレクトリを使用
process.env.CONTENT_DIR = TEST_CONTENT_DIR;

describe("Content API", () => {
  beforeAll(() => {
    // テスト用の記事を作成
    fs.mkdirSync(path.join(TEST_CONTENT_DIR, "asset"), { recursive: true });
    fs.mkdirSync(path.join(TEST_CONTENT_DIR, "tech"), { recursive: true });
    fs.mkdirSync(path.join(TEST_CONTENT_DIR, "health"), { recursive: true });

    // asset記事
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "asset", "article-1.mdx"),
      `---
title: 資産形成記事1
description: 資産形成について
date: 2026-01-20
category: asset
tags: [投資]
published: true
---

本文1
`
    );
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "asset", "article-2.mdx"),
      `---
title: 資産形成記事2
description: 節約について
date: 2026-01-22
category: asset
tags: [節約]
published: true
---

本文2
`
    );
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "asset", "draft.mdx"),
      `---
title: 下書き記事
description: 非公開
date: 2026-01-23
category: asset
published: false
---

下書き
`
    );

    // tech記事
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "tech", "tech-article.mdx"),
      `---
title: 技術記事
description: プログラミングについて
date: 2026-01-21
category: tech
tags: [TypeScript]
published: true
---

技術本文
`
    );

    // health記事
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "health", "health-article.mdx"),
      `---
title: 健康記事
description: 健康について
date: 2026-01-24
category: health
published: true
---

健康本文
`
    );
  });

  afterAll(() => {
    // テスト用ファイルとディレクトリを削除
    fs.rmSync(TEST_CONTENT_DIR, { recursive: true, force: true });
  });

  describe("getArticlesByCategory", () => {
    it("returns published articles for a category", async () => {
      const articles = await getArticlesByCategory("asset");

      expect(articles.length).toBe(2);
      expect(articles.every((a) => a.published)).toBe(true);
      expect(articles.every((a) => a.category === "asset")).toBe(true);
    });

    it("returns articles sorted by date descending", async () => {
      const articles = await getArticlesByCategory("asset");

      expect(articles[0].date).toBe("2026-01-22");
      expect(articles[1].date).toBe("2026-01-20");
    });

    it("includes draft articles when includeDrafts is true", async () => {
      const articles = await getArticlesByCategory("asset", { includeDrafts: true });

      expect(articles.length).toBe(3);
    });
  });

  describe("getAllArticles", () => {
    it("returns all published articles from all categories", async () => {
      const articles = await getAllArticles();

      expect(articles.length).toBe(4); // 2 asset + 1 tech + 1 health
      expect(articles.every((a) => a.published)).toBe(true);
    });

    it("returns articles sorted by date descending", async () => {
      const articles = await getAllArticles();

      const dates = articles.map((a) => a.date);
      expect(dates).toEqual([...dates].sort().reverse());
    });
  });

  describe("getLatestArticles", () => {
    it("returns the specified number of latest articles", async () => {
      const articles = await getLatestArticles(2);

      expect(articles.length).toBe(2);
      expect(articles[0].date).toBe("2026-01-24"); // health
      expect(articles[1].date).toBe("2026-01-22"); // asset-2
    });
  });

  describe("getArticleBySlug", () => {
    it("returns article by category and slug", async () => {
      const article = await getArticleBySlug("tech", "tech-article");

      expect(article).not.toBeNull();
      expect(article?.title).toBe("技術記事");
      expect(article?.content).toContain("技術本文");
    });

    it("returns null for non-existent article", async () => {
      const article = await getArticleBySlug("tech", "nonexistent");

      expect(article).toBeNull();
    });

    it("returns draft article", async () => {
      const article = await getArticleBySlug("asset", "draft");

      expect(article).not.toBeNull();
      expect(article?.published).toBe(false);
    });
  });

  describe("getRelatedArticles", () => {
    it("returns articles from the same category excluding current", async () => {
      const articles = await getRelatedArticles("asset", "article-1", 5);

      expect(articles.length).toBe(1); // article-2のみ（draftは除外）
      expect(articles[0].slug).toBe("article-2");
    });

    it("respects the limit parameter", async () => {
      const articles = await getRelatedArticles("asset", "article-1", 1);

      expect(articles.length).toBe(1);
    });

    it("returns empty array when no related articles exist", async () => {
      const articles = await getRelatedArticles("health", "health-article", 5);

      expect(articles).toEqual([]);
    });
  });
});

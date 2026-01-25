import { describe, it, expect } from "vitest";
import { parseFrontmatter, parseArticle } from "./parser";

describe("parseFrontmatter", () => {
  it("parses valid frontmatter with all fields", () => {
    const content = `---
title: テスト記事
description: これはテスト記事です
date: 2026-01-24
updatedAt: 2026-01-25
category: asset
tags: [投資, 節約]
thumbnail: /images/test.jpg
published: true
---

# 本文
`;

    const result = parseFrontmatter(content);

    expect(result.frontmatter.title).toBe("テスト記事");
    expect(result.frontmatter.description).toBe("これはテスト記事です");
    expect(result.frontmatter.date).toBe("2026-01-24");
    expect(result.frontmatter.updatedAt).toBe("2026-01-25");
    expect(result.frontmatter.category).toBe("asset");
    expect(result.frontmatter.tags).toEqual(["投資", "節約"]);
    expect(result.frontmatter.thumbnail).toBe("/images/test.jpg");
    expect(result.frontmatter.published).toBe(true);
    expect(result.content).toContain("# 本文");
  });

  it("parses frontmatter with required fields only", () => {
    const content = `---
title: 最小限の記事
description: 必須フィールドのみ
date: 2026-01-24
category: tech
---

本文です。
`;

    const result = parseFrontmatter(content);

    expect(result.frontmatter.title).toBe("最小限の記事");
    expect(result.frontmatter.category).toBe("tech");
    expect(result.frontmatter.tags).toBeUndefined();
    expect(result.frontmatter.thumbnail).toBeUndefined();
    expect(result.frontmatter.published).toBeUndefined();
  });

  it("parses health category", () => {
    const content = `---
title: 健康記事
description: 健康について
date: 2026-01-24
category: health
---

本文
`;

    const result = parseFrontmatter(content);
    expect(result.frontmatter.category).toBe("health");
  });
});

describe("parseArticle", () => {
  it("creates ArticleMeta from frontmatter and slug", () => {
    const content = `---
title: テスト記事
description: これはテスト記事です
date: 2026-01-24
category: asset
tags: [投資]
---

本文
`;

    const result = parseArticle(content, "test-article");

    expect(result.slug).toBe("test-article");
    expect(result.title).toBe("テスト記事");
    expect(result.description).toBe("これはテスト記事です");
    expect(result.date).toBe("2026-01-24");
    expect(result.category).toBe("asset");
    expect(result.tags).toEqual(["投資"]);
    expect(result.published).toBe(true); // デフォルト値
    expect(result.content).toContain("本文");
  });

  it("defaults published to true when not specified", () => {
    const content = `---
title: 記事
description: 説明
date: 2026-01-24
category: tech
---

本文
`;

    const result = parseArticle(content, "article");
    expect(result.published).toBe(true);
  });

  it("respects published: false", () => {
    const content = `---
title: 下書き記事
description: 説明
date: 2026-01-24
category: tech
published: false
---

本文
`;

    const result = parseArticle(content, "draft");
    expect(result.published).toBe(false);
  });

  it("defaults tags to empty array when not specified", () => {
    const content = `---
title: タグなし記事
description: 説明
date: 2026-01-24
category: health
---

本文
`;

    const result = parseArticle(content, "no-tags");
    expect(result.tags).toEqual([]);
  });
});

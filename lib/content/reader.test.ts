import { describe, it, expect, beforeAll, afterAll, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

const TEST_CONTENT_DIR = path.join(process.cwd(), "test-content-reader");

// テスト用のコンテンツディレクトリを使用
process.env.CONTENT_DIR = TEST_CONTENT_DIR;

const mockList = vi.fn();
const mockHead = vi.fn();

vi.mock("@vercel/blob", () => ({
  list: (...args: unknown[]) => mockList(...args),
  head: (...args: unknown[]) => mockHead(...args),
}));

import { readArticleFile, listArticleFiles, getContentDirectory } from "./reader";

describe("getContentDirectory", () => {
  it("returns the content directory path", () => {
    const dir = getContentDirectory();
    expect(dir).toContain("content");
  });
});

describe("listArticleFiles", () => {
  beforeAll(() => {
    // テスト用のディレクトリとファイルを作成
    fs.mkdirSync(path.join(TEST_CONTENT_DIR, "asset"), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "asset", "test-article.mdx"),
      `---
title: テスト記事
description: テスト
date: 2026-01-24
category: asset
---

本文
`
    );
  });

  afterAll(() => {
    // テスト用ファイルとディレクトリを削除
    fs.rmSync(TEST_CONTENT_DIR, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Default: Blob returns empty
    mockList.mockRejectedValue(new Error("not configured"));
    mockHead.mockRejectedValue(new Error("not found"));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists mdx files in a category directory", async () => {
    const files = await listArticleFiles("asset");

    expect(files).toContain("test-article.mdx");
  });

  it("returns empty array for non-existent category", async () => {
    const files = await listArticleFiles("nonexistent" as "asset");

    expect(files).toEqual([]);
  });

  it("merges files from Blob storage", async () => {
    mockList.mockResolvedValue({
      blobs: [
        { pathname: "content/asset/blob-article.mdx" },
        { pathname: "content/asset/test-article.mdx" }, // duplicate with FS
      ],
    });

    const files = await listArticleFiles("asset");

    expect(files).toContain("test-article.mdx");
    expect(files).toContain("blob-article.mdx");
    // Deduplication: test-article.mdx appears only once
    expect(files.filter((f) => f === "test-article.mdx")).toHaveLength(1);
  });

  it("returns only Blob files when FS directory does not exist", async () => {
    mockList.mockResolvedValue({
      blobs: [{ pathname: "content/health/blob-only.mdx" }],
    });

    const files = await listArticleFiles("health");

    expect(files).toContain("blob-only.mdx");
  });

  it("filters out non-mdx and nested files from Blob", async () => {
    mockList.mockResolvedValue({
      blobs: [
        { pathname: "content/asset/valid.mdx" },
        { pathname: "content/asset/image.png" },
        { pathname: "content/asset/sub/nested.mdx" },
      ],
    });

    const files = await listArticleFiles("asset");

    expect(files).toContain("valid.mdx");
    expect(files).not.toContain("image.png");
    expect(files).not.toContain("nested.mdx");
  });
});

describe("readArticleFile", () => {
  beforeAll(() => {
    fs.mkdirSync(path.join(TEST_CONTENT_DIR, "tech"), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONTENT_DIR, "tech", "sample.mdx"),
      `---
title: サンプル記事
description: サンプルです
date: 2026-01-25
category: tech
tags: [TypeScript, React]
---

# サンプル本文

これはサンプルです。
`
    );
  });

  afterAll(() => {
    // テスト用ファイルとディレクトリを削除
    fs.rmSync(TEST_CONTENT_DIR, { recursive: true, force: true });
  });

  beforeEach(() => {
    mockHead.mockRejectedValue(new Error("not found"));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reads and parses an mdx file from filesystem", async () => {
    const article = await readArticleFile("tech", "sample");

    expect(article).not.toBeNull();
    expect(article?.title).toBe("サンプル記事");
    expect(article?.slug).toBe("sample");
    expect(article?.category).toBe("tech");
    expect(article?.tags).toEqual(["TypeScript", "React"]);
    expect(article?.content).toContain("# サンプル本文");
  });

  it("falls back to Blob when file not on filesystem", async () => {
    const blobContent = `---
title: Blob記事
description: Blobから取得
date: 2026-02-01
category: tech
tags: [Blob]
published: true
---

# Blob本文
`;
    mockHead.mockResolvedValue({
      url: "https://blob.vercel-storage.com/content/tech/blob-article.mdx",
    });

    // Mock global fetch for Blob URL
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(blobContent, { status: 200 })
    );

    const article = await readArticleFile("tech", "blob-article");

    expect(article).not.toBeNull();
    expect(article?.title).toBe("Blob記事");
    expect(article?.content).toContain("# Blob本文");
    expect(mockHead).toHaveBeenCalledWith("content/tech/blob-article.mdx");

    mockFetch.mockRestore();
  });

  it("returns null for non-existent file", async () => {
    const article = await readArticleFile("tech", "nonexistent");

    expect(article).toBeNull();
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readArticleFile, listArticleFiles, getContentDirectory } from "./reader";
import * as fs from "fs";
import * as path from "path";

const TEST_CONTENT_DIR = path.join(process.cwd(), "test-content-reader");

// テスト用のコンテンツディレクトリを使用
process.env.CONTENT_DIR = TEST_CONTENT_DIR;

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

  it("lists mdx files in a category directory", async () => {
    const files = await listArticleFiles("asset");

    expect(files).toContain("test-article.mdx");
  });

  it("returns empty array for non-existent category", async () => {
    const files = await listArticleFiles("nonexistent" as "asset");

    expect(files).toEqual([]);
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

  it("reads and parses an mdx file", async () => {
    const article = await readArticleFile("tech", "sample");

    expect(article).not.toBeNull();
    expect(article?.title).toBe("サンプル記事");
    expect(article?.slug).toBe("sample");
    expect(article?.category).toBe("tech");
    expect(article?.tags).toEqual(["TypeScript", "React"]);
    expect(article?.content).toContain("# サンプル本文");
  });

  it("returns null for non-existent file", async () => {
    const article = await readArticleFile("tech", "nonexistent");

    expect(article).toBeNull();
  });
});

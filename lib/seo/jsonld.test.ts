import { describe, it, expect } from "vitest";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  type ArticleJsonLdProps,
  type BreadcrumbItem,
} from "./jsonld";

describe("JSON-LD Generator", () => {
  describe("generateArticleJsonLd", () => {
    const baseArticle: ArticleJsonLdProps = {
      title: "テスト記事タイトル",
      description: "テスト記事の説明文です。",
      datePublished: "2026-01-27",
      url: "https://example.com/tech/test-article",
      authorName: "テスト著者",
    };

    it("基本的なArticleスキーマを生成する", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("Article");
      expect(jsonLd.headline).toBe("テスト記事タイトル");
      expect(jsonLd.description).toBe("テスト記事の説明文です。");
      expect(jsonLd.datePublished).toBe("2026-01-27");
      expect(jsonLd.url).toBe("https://example.com/tech/test-article");
    });

    it("著者情報を含む", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.author).toEqual({
        "@type": "Person",
        name: "テスト著者",
      });
    });

    it("更新日が指定されている場合はdateModifiedを含む", () => {
      const articleWithUpdate = {
        ...baseArticle,
        dateModified: "2026-01-28",
      };

      const jsonLd = generateArticleJsonLd(articleWithUpdate);

      expect(jsonLd.dateModified).toBe("2026-01-28");
    });

    it("画像が指定されている場合はimageを含む", () => {
      const articleWithImage = {
        ...baseArticle,
        image: "https://example.com/image.jpg",
      };

      const jsonLd = generateArticleJsonLd(articleWithImage);

      expect(jsonLd.image).toBe("https://example.com/image.jpg");
    });

    it("更新日がない場合はdateModifiedを含まない", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.dateModified).toBeUndefined();
    });

    it("画像がない場合はimageを含まない", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.image).toBeUndefined();
    });
  });

  describe("generateBreadcrumbJsonLd", () => {
    it("パンくずリストのスキーマを生成する", () => {
      const items: BreadcrumbItem[] = [
        { name: "ホーム", url: "https://example.com/" },
        { name: "テクノロジー", url: "https://example.com/tech" },
        { name: "テスト記事", url: "https://example.com/tech/test-article" },
      ];

      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("BreadcrumbList");
      expect(jsonLd.itemListElement).toHaveLength(3);
    });

    it("各アイテムに正しいpositionを付与する", () => {
      const items: BreadcrumbItem[] = [
        { name: "ホーム", url: "https://example.com/" },
        { name: "テクノロジー", url: "https://example.com/tech" },
      ];

      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd.itemListElement[0].position).toBe(1);
      expect(jsonLd.itemListElement[1].position).toBe(2);
    });

    it("各アイテムにListItem型を設定する", () => {
      const items: BreadcrumbItem[] = [
        { name: "ホーム", url: "https://example.com/" },
      ];

      const jsonLd = generateBreadcrumbJsonLd(items);

      expect(jsonLd.itemListElement[0]["@type"]).toBe("ListItem");
      expect(jsonLd.itemListElement[0].name).toBe("ホーム");
      expect(jsonLd.itemListElement[0].item).toBe("https://example.com/");
    });

    it("空の配列を渡すと空のitemListElementを返す", () => {
      const jsonLd = generateBreadcrumbJsonLd([]);

      expect(jsonLd.itemListElement).toHaveLength(0);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  serializeJsonLd,
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

    it("authorUrlが指定されている場合はauthor.urlを含む", () => {
      const articleWithAuthorUrl = {
        ...baseArticle,
        authorUrl: "https://example.com/about",
      };

      const jsonLd = generateArticleJsonLd(articleWithAuthorUrl);

      expect(jsonLd.author.url).toBe("https://example.com/about");
    });

    it("authorJobTitleが指定されている場合はauthor.jobTitleを含む", () => {
      const articleWithJobTitle = {
        ...baseArticle,
        authorJobTitle: "現役エンジニア",
      };

      const jsonLd = generateArticleJsonLd(articleWithJobTitle);

      expect(jsonLd.author.jobTitle).toBe("現役エンジニア");
    });

    it("authorUrlが指定されていない場合はauthor.urlを含まない", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.author.url).toBeUndefined();
    });

    it("authorJobTitleが指定されていない場合はauthor.jobTitleを含まない", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.author.jobTitle).toBeUndefined();
    });

    it("authorSameAsが指定されている場合はauthor.sameAsを含む", () => {
      const articleWithSameAs = {
        ...baseArticle,
        authorSameAs: [
          "https://www.threads.com/@pao_engineer",
          "https://x.com/cssk_pao",
        ],
      };

      const jsonLd = generateArticleJsonLd(articleWithSameAs);

      expect(jsonLd.author.sameAs).toEqual([
        "https://www.threads.com/@pao_engineer",
        "https://x.com/cssk_pao",
      ]);
    });

    it("authorSameAsが指定されていない場合はauthor.sameAsを含まない", () => {
      const jsonLd = generateArticleJsonLd(baseArticle);

      expect(jsonLd.author.sameAs).toBeUndefined();
    });

    it("authorSameAsが空配列の場合はauthor.sameAsを含まない", () => {
      const articleWithEmptySameAs = {
        ...baseArticle,
        authorSameAs: [],
      };

      const jsonLd = generateArticleJsonLd(articleWithEmptySameAs);

      expect(jsonLd.author.sameAs).toBeUndefined();
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

  describe("serializeJsonLd", () => {
    it("通常のオブジェクトをJSON文字列にシリアライズする", () => {
      const result = serializeJsonLd({ headline: "テスト記事" });

      expect(result).toBe('{"headline":"テスト記事"}');
      expect(JSON.parse(result)).toEqual({ headline: "テスト記事" });
    });

    it("`<`をエスケープして</script>ブレイクアウトを防ぐ", () => {
      const result = serializeJsonLd({
        headline: "</script><script>alert('xss')</script>",
      });

      expect(result).not.toContain("</script>");
      expect(result).not.toContain("<");
      expect(result).toContain("\\u003c");
    });

    it("エスケープ後もJSONとしてパース可能で元の値を保持する", () => {
      const payload = { description: "a < b かつ </script> を含む" };

      const result = serializeJsonLd(payload);

      expect(JSON.parse(result)).toEqual(payload);
    });
  });
});

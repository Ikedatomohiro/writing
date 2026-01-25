import { describe, it, expect } from "vitest";
import { getThemeFromPath } from "./utils";

describe("getThemeFromPath", () => {
  describe("Investment theme", () => {
    it("returns 'investment' for /asset path", () => {
      expect(getThemeFromPath("/asset")).toBe("investment");
    });

    it("returns 'investment' for /asset/article-slug path", () => {
      expect(getThemeFromPath("/asset/some-article")).toBe("investment");
    });

    it("returns 'investment' for /asset/nested/path", () => {
      expect(getThemeFromPath("/asset/nested/deep/path")).toBe("investment");
    });
  });

  describe("Programming theme", () => {
    it("returns 'programming' for /tech path", () => {
      expect(getThemeFromPath("/tech")).toBe("programming");
    });

    it("returns 'programming' for /tech/article-slug path", () => {
      expect(getThemeFromPath("/tech/some-article")).toBe("programming");
    });
  });

  describe("Health theme", () => {
    it("returns 'health' for /health path", () => {
      expect(getThemeFromPath("/health")).toBe("health");
    });

    it("returns 'health' for /health/article-slug path", () => {
      expect(getThemeFromPath("/health/some-article")).toBe("health");
    });
  });

  describe("Default theme", () => {
    it("returns 'investment' for root path", () => {
      expect(getThemeFromPath("/")).toBe("investment");
    });

    it("returns 'investment' for unknown path", () => {
      expect(getThemeFromPath("/unknown")).toBe("investment");
    });

    it("returns 'investment' for /articles path", () => {
      expect(getThemeFromPath("/articles")).toBe("investment");
    });
  });
});

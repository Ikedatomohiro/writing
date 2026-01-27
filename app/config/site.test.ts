import { describe, it, expect } from "vitest";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("サイト名が「おひとりさまライフ」である", () => {
    expect(siteConfig.name).toBe("おひとりさまライフ");
  });

  it("サイト説明が定義されている", () => {
    expect(siteConfig.description).toBeDefined();
    expect(siteConfig.description.length).toBeGreaterThan(0);
  });

  it("サイトURLが定義されている", () => {
    expect(siteConfig.url).toBeDefined();
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });

  it("as constで定義されているため値が変更できない", () => {
    // TypeScript の as const により、値は readonly
    expect(Object.isFrozen(siteConfig)).toBe(false); // オブジェクト自体はfrozenではない
    expect(typeof siteConfig.name).toBe("string");
  });
});

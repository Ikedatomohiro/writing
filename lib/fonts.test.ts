import { describe, it, expect, vi } from "vitest";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Manrope: vi.fn(() => ({
    variable: "--font-manrope",
    className: "manrope-class",
  })),
  Inter: vi.fn(() => ({
    variable: "--font-inter",
    className: "inter-class",
  })),
  Fira_Code: vi.fn(() => ({
    variable: "--font-fira-code",
    className: "fira-code-class",
  })),
  Noto_Sans_JP: vi.fn(() => ({
    variable: "--font-noto-sans-jp",
    className: "noto-sans-jp-class",
  })),
}));

import { manrope, inter, firaCode, notoSansJP, fontVariables } from "./fonts";

describe("fonts", () => {
  describe("manrope", () => {
    it("should have a CSS variable", () => {
      expect(manrope.variable).toBe("--font-manrope");
    });

    it("should have a className", () => {
      expect(manrope.className).toBeDefined();
    });
  });

  describe("inter", () => {
    it("should have a CSS variable", () => {
      expect(inter.variable).toBe("--font-inter");
    });

    it("should have a className", () => {
      expect(inter.className).toBeDefined();
    });
  });

  describe("firaCode", () => {
    it("should have a CSS variable", () => {
      expect(firaCode.variable).toBe("--font-fira-code");
    });

    it("should have a className", () => {
      expect(firaCode.className).toBeDefined();
    });
  });

  describe("notoSansJP", () => {
    it("should have a CSS variable", () => {
      expect(notoSansJP.variable).toBe("--font-noto-sans-jp");
    });

    it("should have a className", () => {
      expect(notoSansJP.className).toBeDefined();
    });
  });

  describe("fontVariables", () => {
    it("should contain all font variables", () => {
      expect(fontVariables).toContain(manrope.variable);
      expect(fontVariables).toContain(inter.variable);
      expect(fontVariables).toContain(firaCode.variable);
      expect(fontVariables).toContain(notoSansJP.variable);
    });
  });
});

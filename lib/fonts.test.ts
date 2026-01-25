import { describe, it, expect, vi } from "vitest";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Noto_Sans_JP: vi.fn(() => ({
    variable: "--font-noto-sans-jp",
    className: "noto-sans-jp-class",
  })),
  Inter: vi.fn(() => ({
    variable: "--font-inter",
    className: "inter-class",
  })),
  JetBrains_Mono: vi.fn(() => ({
    variable: "--font-jetbrains-mono",
    className: "jetbrains-mono-class",
  })),
}));

import { notoSansJP, inter, jetbrainsMono, fontVariables } from "./fonts";

describe("fonts", () => {
  describe("notoSansJP", () => {
    it("should have a CSS variable", () => {
      expect(notoSansJP.variable).toBeDefined();
      expect(notoSansJP.variable).toContain("--font");
    });

    it("should have a className", () => {
      expect(notoSansJP.className).toBeDefined();
    });
  });

  describe("inter", () => {
    it("should have a CSS variable", () => {
      expect(inter.variable).toBeDefined();
      expect(inter.variable).toContain("--font");
    });

    it("should have a className", () => {
      expect(inter.className).toBeDefined();
    });
  });

  describe("jetbrainsMono", () => {
    it("should have a CSS variable", () => {
      expect(jetbrainsMono.variable).toBeDefined();
      expect(jetbrainsMono.variable).toContain("--font");
    });

    it("should have a className", () => {
      expect(jetbrainsMono.className).toBeDefined();
    });
  });

  describe("fontVariables", () => {
    it("should contain all font variables", () => {
      expect(fontVariables).toContain(notoSansJP.variable);
      expect(fontVariables).toContain(inter.variable);
      expect(fontVariables).toContain(jetbrainsMono.variable);
    });
  });
});

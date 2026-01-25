import { describe, it, expect } from "vitest";
import { typography, FONT_SIZES, LINE_HEIGHTS, FONT_WEIGHTS } from "./typography";

describe("typography", () => {
  describe("FONT_SIZES", () => {
    it("should define h1 size as 2rem (32px)", () => {
      expect(FONT_SIZES.h1).toBe("2rem");
    });

    it("should define h2 size as 1.5rem (24px)", () => {
      expect(FONT_SIZES.h2).toBe("1.5rem");
    });

    it("should define h3 size as 1.25rem (20px)", () => {
      expect(FONT_SIZES.h3).toBe("1.25rem");
    });

    it("should define h4 size as 1.125rem (18px)", () => {
      expect(FONT_SIZES.h4).toBe("1.125rem");
    });

    it("should define body size as 1rem (16px)", () => {
      expect(FONT_SIZES.body).toBe("1rem");
    });

    it("should define caption size as 0.875rem (14px)", () => {
      expect(FONT_SIZES.caption).toBe("0.875rem");
    });

    it("should define small size as 0.75rem (12px)", () => {
      expect(FONT_SIZES.small).toBe("0.75rem");
    });
  });

  describe("LINE_HEIGHTS", () => {
    it("should define heading line height as 1.4", () => {
      expect(LINE_HEIGHTS.heading).toBe("1.4");
    });

    it("should define body line height as 1.8", () => {
      expect(LINE_HEIGHTS.body).toBe("1.8");
    });

    it("should define caption line height as 1.5", () => {
      expect(LINE_HEIGHTS.caption).toBe("1.5");
    });
  });

  describe("FONT_WEIGHTS", () => {
    it("should define h1 weight as 700", () => {
      expect(FONT_WEIGHTS.h1).toBe("700");
    });

    it("should define h2 weight as 700", () => {
      expect(FONT_WEIGHTS.h2).toBe("700");
    });

    it("should define h3 weight as 600", () => {
      expect(FONT_WEIGHTS.h3).toBe("600");
    });

    it("should define h4 weight as 600", () => {
      expect(FONT_WEIGHTS.h4).toBe("600");
    });

    it("should define body weight as 400", () => {
      expect(FONT_WEIGHTS.body).toBe("400");
    });
  });

  describe("typography styles", () => {
    it("should define h1 style correctly", () => {
      expect(typography.h1.fontSize).toBe(FONT_SIZES.h1);
      expect(typography.h1.fontWeight).toBe(FONT_WEIGHTS.h1);
      expect(typography.h1.lineHeight).toBe(LINE_HEIGHTS.heading);
    });

    it("should define body style correctly", () => {
      expect(typography.body.fontSize).toBe(FONT_SIZES.body);
      expect(typography.body.fontWeight).toBe(FONT_WEIGHTS.body);
      expect(typography.body.lineHeight).toBe(LINE_HEIGHTS.body);
    });

    it("should define caption style correctly", () => {
      expect(typography.caption.fontSize).toBe(FONT_SIZES.caption);
    });

    it("should define small style correctly", () => {
      expect(typography.small.fontSize).toBe(FONT_SIZES.small);
    });
  });
});

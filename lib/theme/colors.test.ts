import { describe, it, expect } from "vitest";
import { COLORS } from "./colors";

describe("COLORS", () => {
  describe("text colors", () => {
    it("should define text primary color", () => {
      expect(COLORS.textPrimary).toBe("#1C1917");
    });

    it("should define text secondary color", () => {
      expect(COLORS.textSecondary).toBe("#57534E");
    });

    it("should define text muted color", () => {
      expect(COLORS.textMuted).toBe("#A8A29E");
    });
  });

  describe("background colors", () => {
    it("should define bg primary color", () => {
      expect(COLORS.bgPrimary).toBe("#FAFAF9");
    });

    it("should define bg surface color", () => {
      expect(COLORS.bgSurface).toBe("#F5F5F4");
    });

    it("should define bg card color", () => {
      expect(COLORS.bgCard).toBe("#FFFFFF");
    });
  });

  describe("border colors", () => {
    it("should define border color", () => {
      expect(COLORS.border).toBe("#E7E5E4");
    });

    it("should define border strong color", () => {
      expect(COLORS.borderStrong).toBe("#D6D3D1");
    });
  });
});

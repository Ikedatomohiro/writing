import { describe, it, expect } from "vitest";
import { formatRate, formatInt, barWidthPercent } from "./format";

describe("formatRate", () => {
  it("率をパーセント表記にする", () => {
    expect(formatRate(0.1234)).toBe("12.3%");
  });
  it("null は em dash", () => {
    expect(formatRate(null)).toBe("—");
  });
  it("0 は 0.0%", () => {
    expect(formatRate(0)).toBe("0.0%");
  });
});

describe("formatInt", () => {
  it("千区切りを入れる", () => {
    expect(formatInt(12345)).toBe("12,345");
  });
});

describe("barWidthPercent", () => {
  it("最大値を 100% に正規化する", () => {
    expect(barWidthPercent(0.05, 0.1)).toBe(50);
  });
  it("最大値が 0 や null なら 0", () => {
    expect(barWidthPercent(0.05, 0)).toBe(0);
    expect(barWidthPercent(null, 0.1)).toBe(0);
  });
});

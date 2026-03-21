import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdsenseSlot } from "./Ad";

afterEach(() => {
  cleanup();
});

describe("AdsenseSlot", () => {
  it("renders ins element with correct attributes", () => {
    render(<AdsenseSlot slotId="1234567890" isFluid={false} />);
    const insElement = screen.getByTestId("adsense-slot");
    expect(insElement.tagName.toLowerCase()).toBe("ins");
    expect(insElement).toHaveAttribute("data-ad-slot", "1234567890");
    expect(insElement).toHaveClass("adsbygoogle");
    expect(insElement).toHaveAttribute("data-ad-format", "auto");
  });

  it("renders ins element with fluid format when isFluid is true", () => {
    render(<AdsenseSlot slotId="9876543210" isFluid={true} />);
    const insElement = screen.getByTestId("adsense-slot");
    expect(insElement).toHaveAttribute("data-ad-format", "fluid");
  });

  it("has required Adsense attributes", () => {
    render(<AdsenseSlot slotId="1234567890" isFluid={false} />);
    const insElement = screen.getByTestId("adsense-slot");
    // data-ad-clientはNEXT_PUBLIC_ADSENSE_CLIENT_ID環境変数から取得
    // テスト環境では未設定のため属性値はundefined
    expect(insElement).toHaveAttribute("data-full-width-responsive", "true");
  });
});

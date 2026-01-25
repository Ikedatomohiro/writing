import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AdsenseSlot } from "./Ad";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("AdsenseSlot", () => {
  it("renders ins element with correct attributes", () => {
    renderWithChakra(<AdsenseSlot slotId="1234567890" isFluid={false} />);
    const insElement = screen.getByTestId("adsense-slot");
    expect(insElement.tagName.toLowerCase()).toBe("ins");
    expect(insElement).toHaveAttribute("data-ad-slot", "1234567890");
    expect(insElement).toHaveClass("adsbygoogle");
    expect(insElement).toHaveAttribute("data-ad-format", "auto");
  });

  it("renders ins element with fluid format when isFluid is true", () => {
    renderWithChakra(<AdsenseSlot slotId="9876543210" isFluid={true} />);
    const insElement = screen.getByTestId("adsense-slot");
    expect(insElement).toHaveAttribute("data-ad-format", "fluid");
  });

  it("has required Adsense attributes", () => {
    renderWithChakra(<AdsenseSlot slotId="1234567890" isFluid={false} />);
    const insElement = screen.getByTestId("adsense-slot");
    // data-ad-clientはNEXT_PUBLIC_ADSENSE_CLIENT_ID環境変数から取得
    // テスト環境では未設定のため属性値はundefined
    expect(insElement).toHaveAttribute("data-full-width-responsive", "true");
  });
});

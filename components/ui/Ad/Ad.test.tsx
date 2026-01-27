import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Ad, type AdVariant, getAdsEnabled } from "./Ad";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Ad", () => {
  describe("rendering", () => {
    it("renders as a container element", () => {
      renderWithChakra(<Ad variant="rectangle" />);
      expect(screen.getByTestId("ad-container")).toBeInTheDocument();
    });

    it("renders placeholder in development mode", () => {
      renderWithChakra(<Ad variant="rectangle" />);
      expect(screen.getByText("広告")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    const variantTests: { variant: AdVariant; expectedWidth: number; expectedHeight: number }[] = [
      { variant: "leaderboard", expectedWidth: 728, expectedHeight: 90 },
      { variant: "rectangle", expectedWidth: 300, expectedHeight: 250 },
      { variant: "skyscraper", expectedWidth: 300, expectedHeight: 600 },
    ];

    it.each(variantTests)(
      "applies $variant variant with correct dimensions",
      ({ variant, expectedWidth, expectedHeight }) => {
        renderWithChakra(<Ad variant={variant} />);
        const container = screen.getByTestId("ad-container");
        expect(container).toHaveAttribute("data-variant", variant);
        expect(container).toHaveAttribute("data-width", String(expectedWidth));
        expect(container).toHaveAttribute("data-height", String(expectedHeight));
      }
    );

    it("applies infeed variant with fluid width", () => {
      renderWithChakra(<Ad variant="infeed" />);
      const container = screen.getByTestId("ad-container");
      expect(container).toHaveAttribute("data-variant", "infeed");
      expect(container).toHaveAttribute("data-width", "fluid");
    });

    it("applies in-article variant with fluid width", () => {
      renderWithChakra(<Ad variant="in-article" />);
      const container = screen.getByTestId("ad-container");
      expect(container).toHaveAttribute("data-variant", "in-article");
      expect(container).toHaveAttribute("data-width", "fluid");
    });
  });

  describe("ad label", () => {
    it("shows ad label by default", () => {
      renderWithChakra(<Ad variant="rectangle" />);
      expect(screen.getByText("広告")).toBeInTheDocument();
    });

    it("hides ad label when showLabel is false", () => {
      renderWithChakra(<Ad variant="rectangle" showLabel={false} />);
      expect(screen.queryByText("広告")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has aria-label for ad container", () => {
      renderWithChakra(<Ad variant="rectangle" />);
      expect(screen.getByLabelText("広告")).toBeInTheDocument();
    });
  });
});

describe("getAdsEnabled", () => {
  it("returns false when NEXT_PUBLIC_ADS_ENABLED is not set", () => {
    // Default behavior: ads disabled
    expect(getAdsEnabled()).toBe(false);
  });

  it("is exported as a function", () => {
    expect(typeof getAdsEnabled).toBe("function");
  });
});

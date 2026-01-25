import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AdSlot } from "./AdSlot";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("AdSlot", () => {
  describe("rendering", () => {
    it("renders with correct data-testid", () => {
      renderWithChakra(<AdSlot size="rectangle" />);
      expect(screen.getByTestId("ad-slot")).toBeInTheDocument();
    });

    it("renders children when provided", () => {
      renderWithChakra(
        <AdSlot size="rectangle">
          <div>Ad Content</div>
        </AdSlot>
      );
      expect(screen.getByText("Ad Content")).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it("applies rectangle size", () => {
      renderWithChakra(<AdSlot size="rectangle" />);
      const slot = screen.getByTestId("ad-slot");
      expect(slot).toHaveAttribute("data-size", "rectangle");
    });

    it("applies skyscraper size", () => {
      renderWithChakra(<AdSlot size="skyscraper" />);
      const slot = screen.getByTestId("ad-slot");
      expect(slot).toHaveAttribute("data-size", "skyscraper");
    });

    it("applies leaderboard size", () => {
      renderWithChakra(<AdSlot size="leaderboard" />);
      const slot = screen.getByTestId("ad-slot");
      expect(slot).toHaveAttribute("data-size", "leaderboard");
    });
  });

  describe("placeholder", () => {
    it("shows placeholder when showPlaceholder is true", () => {
      renderWithChakra(<AdSlot size="rectangle" showPlaceholder />);
      expect(screen.getByText("広告")).toBeInTheDocument();
    });

    it("does not show placeholder by default", () => {
      renderWithChakra(<AdSlot size="rectangle" />);
      expect(screen.queryByText("広告")).not.toBeInTheDocument();
    });
  });

  describe("slot id", () => {
    it("renders with slot id attribute", () => {
      renderWithChakra(<AdSlot size="rectangle" slotId="sidebar-ad-1" />);
      const slot = screen.getByTestId("ad-slot");
      expect(slot).toHaveAttribute("data-slot-id", "sidebar-ad-1");
    });
  });

  describe("accessibility", () => {
    it("has correct role", () => {
      renderWithChakra(<AdSlot size="rectangle" />);
      expect(
        screen.getByRole("region", { name: /advertisement/i })
      ).toBeInTheDocument();
    });

    it("has correct aria-label", () => {
      renderWithChakra(<AdSlot size="rectangle" />);
      expect(screen.getByLabelText("Advertisement")).toBeInTheDocument();
    });
  });
});

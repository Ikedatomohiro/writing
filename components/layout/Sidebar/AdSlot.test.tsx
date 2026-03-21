import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdSlot } from "./AdSlot";

describe("AdSlot", () => {
  describe("when ads are enabled", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ADS_ENABLED = "true";
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_ADS_ENABLED;
      cleanup();
    });

    describe("rendering", () => {
      it("renders with correct data-testid", () => {
        render(<AdSlot size="rectangle" />);
        expect(screen.getByTestId("ad-slot")).toBeInTheDocument();
      });

      it("renders children when provided", () => {
        render(
          <AdSlot size="rectangle">
            <div>Ad Content</div>
          </AdSlot>
        );
        expect(screen.getByText("Ad Content")).toBeInTheDocument();
      });
    });

    describe("sizes", () => {
      it("applies rectangle size", () => {
        render(<AdSlot size="rectangle" />);
        const slot = screen.getByTestId("ad-slot");
        expect(slot).toHaveAttribute("data-size", "rectangle");
      });

      it("applies skyscraper size", () => {
        render(<AdSlot size="skyscraper" />);
        const slot = screen.getByTestId("ad-slot");
        expect(slot).toHaveAttribute("data-size", "skyscraper");
      });

      it("applies leaderboard size", () => {
        render(<AdSlot size="leaderboard" />);
        const slot = screen.getByTestId("ad-slot");
        expect(slot).toHaveAttribute("data-size", "leaderboard");
      });
    });

    describe("placeholder", () => {
      it("shows placeholder when showPlaceholder is true", () => {
        render(<AdSlot size="rectangle" showPlaceholder />);
        expect(screen.getByText("広告")).toBeInTheDocument();
      });

      it("does not show placeholder by default", () => {
        render(<AdSlot size="rectangle" />);
        expect(screen.queryByText("広告")).not.toBeInTheDocument();
      });
    });

    describe("slot id", () => {
      it("renders with slot id attribute", () => {
        render(<AdSlot size="rectangle" slotId="sidebar-ad-1" />);
        const slot = screen.getByTestId("ad-slot");
        expect(slot).toHaveAttribute("data-slot-id", "sidebar-ad-1");
      });
    });

    describe("accessibility", () => {
      it("has correct role", () => {
        render(<AdSlot size="rectangle" />);
        expect(
          screen.getByRole("region", { name: /advertisement/i })
        ).toBeInTheDocument();
      });

      it("has correct aria-label", () => {
        render(<AdSlot size="rectangle" />);
        expect(screen.getByLabelText("Advertisement")).toBeInTheDocument();
      });
    });
  });

  describe("when ads are disabled", () => {
    afterEach(() => {
      cleanup();
    });

    it("returns null when NEXT_PUBLIC_ADS_ENABLED is not true", () => {
      render(<AdSlot size="rectangle" />);
      expect(screen.queryByTestId("ad-slot")).not.toBeInTheDocument();
    });
  });
});

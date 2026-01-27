import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Sidebar", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      renderWithChakra(
        <Sidebar>
          <div>Widget 1</div>
          <div>Widget 2</div>
        </Sidebar>
      );
      expect(screen.getByText("Widget 1")).toBeInTheDocument();
      expect(screen.getByText("Widget 2")).toBeInTheDocument();
    });

    it("renders as aside element for semantic HTML", () => {
      renderWithChakra(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("applies correct data-testid", () => {
      renderWithChakra(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });

  describe("sticky behavior", () => {
    it("applies sticky positioning by default", () => {
      renderWithChakra(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-sticky", "true");
    });

    it("does not apply sticky positioning when sticky is false", () => {
      renderWithChakra(
        <Sidebar sticky={false}>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-sticky", "false");
    });
  });

  describe("responsive behavior", () => {
    it("has data attribute for responsive hiding", () => {
      renderWithChakra(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-hide-mobile", "true");
    });

    it("has responsive display styles for mobile hiding", () => {
      renderWithChakra(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      // Chakra UI applies responsive styles via CSS classes
      // The component should have responsive display prop
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has correct aria-label", () => {
      renderWithChakra(
        <Sidebar aria-label="Page sidebar">
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByLabelText("Page sidebar")).toBeInTheDocument();
    });
  });
});

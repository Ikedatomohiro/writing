import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

afterEach(() => {
  cleanup();
});

describe("Sidebar", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <Sidebar>
          <div>Widget 1</div>
          <div>Widget 2</div>
        </Sidebar>
      );
      expect(screen.getByText("Widget 1")).toBeInTheDocument();
      expect(screen.getByText("Widget 2")).toBeInTheDocument();
    });

    it("renders as aside element for semantic HTML", () => {
      render(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("applies correct data-testid", () => {
      render(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });

  describe("sticky behavior", () => {
    it("applies sticky positioning by default", () => {
      render(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-sticky", "true");
    });

    it("does not apply sticky positioning when sticky is false", () => {
      render(
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
      render(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-hide-mobile", "true");
    });

    it("renders the sidebar element", () => {
      render(
        <Sidebar>
          <div>Content</div>
        </Sidebar>
      );
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has correct aria-label", () => {
      render(
        <Sidebar aria-label="Page sidebar">
          <div>Content</div>
        </Sidebar>
      );
      expect(screen.getByLabelText("Page sidebar")).toBeInTheDocument();
    });
  });
});

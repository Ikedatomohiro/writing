import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BlogHeader } from "./BlogHeader";
import { SITE_CONFIG } from "@/lib/constants/site";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BlogHeader", () => {
  describe("rendering", () => {
    it("renders site name", () => {
      render(<BlogHeader />);
      expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
    });

    it("renders as header element", () => {
      render(<BlogHeader />);
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("site name links to home page", () => {
      render(<BlogHeader />);
      const homeLink = screen.getByRole("link", { name: new RegExp(SITE_CONFIG.name, "i") });
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("navigation", () => {
    it("renders all category navigation links on desktop", () => {
      render(<BlogHeader />);

      // Check desktop navigation links
      expect(screen.getByRole("link", { name: "資産形成" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "プログラミング" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "健康" })).toBeInTheDocument();
    });

    it("has correct href for each category", () => {
      render(<BlogHeader />);

      expect(screen.getByRole("link", { name: "資産形成" })).toHaveAttribute("href", "/asset");
      expect(screen.getByRole("link", { name: "プログラミング" })).toHaveAttribute("href", "/tech");
      expect(screen.getByRole("link", { name: "健康" })).toHaveAttribute("href", "/health");
    });
  });

  describe("mobile menu", () => {
    it("renders mobile menu button (hidden on desktop via CSS)", () => {
      render(<BlogHeader />);
      // The mobile menu button is rendered but hidden via CSS on desktop
      // We verify it exists in the DOM
      const mobileMenuContainer = document.querySelector('[data-component="blog-header"] button');
      expect(mobileMenuContainer).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("has header data attribute", () => {
      render(<BlogHeader />);
      const header = screen.getByRole("banner");
      expect(header).toHaveAttribute("data-component", "blog-header");
    });
  });
});

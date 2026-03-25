import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogHeader } from "./BlogHeader";
import { SITE_CONFIG } from "@/lib/constants/site";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ push: mockPush })),
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

  describe("search and subscribe", () => {
    it("renders search input", () => {
      render(<BlogHeader />);
      const searchInput = screen.getByTestId("header-search-input");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "記事を検索...");
    });

    it("navigates to /search with query on Enter", async () => {
      const user = userEvent.setup();
      render(<BlogHeader />);
      const searchInput = screen.getByTestId("header-search-input");
      await user.type(searchInput, "テスト記事{enter}");
      expect(mockPush).toHaveBeenCalledWith("/search?q=%E3%83%86%E3%82%B9%E3%83%88%E8%A8%98%E4%BA%8B");
    });

    it("does not navigate on Enter with empty query", async () => {
      const user = userEvent.setup();
      render(<BlogHeader />);
      const searchInput = screen.getByTestId("header-search-input");
      await user.type(searchInput, "   {enter}");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("renders subscribe button with Japanese text linking to /search", () => {
      render(<BlogHeader />);
      const subscribeButton = screen.getByTestId("header-subscribe-button");
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toHaveTextContent("購読");
      expect(subscribeButton).toHaveAttribute("href", "/search");
    });
  });

  describe("mobile menu", () => {
    it("renders mobile menu button (hidden on desktop via CSS)", () => {
      render(<BlogHeader />);
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

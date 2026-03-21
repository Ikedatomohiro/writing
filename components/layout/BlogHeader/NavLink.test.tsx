import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NavLink } from "./NavLink";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NavLink", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      mockUsePathname.mockReturnValue("/");
      render(<NavLink href="/asset">資産形成</NavLink>);
      expect(screen.getByRole("link")).toHaveTextContent("資産形成");
    });

    it("has correct href attribute", () => {
      mockUsePathname.mockReturnValue("/");
      render(<NavLink href="/tech">プログラミング</NavLink>);
      expect(screen.getByRole("link")).toHaveAttribute("href", "/tech");
    });
  });

  describe("active state", () => {
    it("is active when pathname starts with href", () => {
      mockUsePathname.mockReturnValue("/asset/article-1");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "true");
    });

    it("is active when pathname exactly matches href", () => {
      mockUsePathname.mockReturnValue("/tech");
      render(<NavLink href="/tech">プログラミング</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "true");
    });

    it("is not active when pathname does not match", () => {
      mockUsePathname.mockReturnValue("/health");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "false");
    });

    it("is not active on root path", () => {
      mockUsePathname.mockReturnValue("/");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "false");
    });

    it("does not match similar prefixes (e.g., /a should not match /asset)", () => {
      mockUsePathname.mockReturnValue("/a");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "false");
    });

    it("matches subpaths correctly with trailing slash", () => {
      mockUsePathname.mockReturnValue("/asset/category/article");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-active", "true");
    });
  });

  describe("accessibility", () => {
    it("has aria-current when active", () => {
      mockUsePathname.mockReturnValue("/asset");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-current", "page");
    });

    it("does not have aria-current when not active", () => {
      mockUsePathname.mockReturnValue("/tech");
      render(<NavLink href="/asset">資産形成</NavLink>);
      const link = screen.getByRole("link");
      expect(link).not.toHaveAttribute("aria-current");
    });
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Link } from "./Link";

afterEach(() => {
  cleanup();
});

describe("Link", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Link href="/test">Click me</Link>);
      expect(screen.getByRole("link")).toHaveTextContent("Click me");
    });

    it("renders as an anchor element", () => {
      render(<Link href="/test">Link</Link>);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("has correct href attribute", () => {
      render(<Link href="/about">About</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("href", "/about");
    });
  });

  describe("external links", () => {
    it("opens in new tab when external prop is true", () => {
      render(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("styling", () => {
    it("applies accent color", () => {
      render(<Link href="/test">Styled</Link>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-styled", "true");
    });
  });

  describe("accessibility", () => {
    it("supports aria-label", () => {
      render(
        <Link href="/test" aria-label="Go to test page">
          Test
        </Link>
      );
      expect(screen.getByLabelText("Go to test page")).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Link } from "./Link";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Link", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      renderWithChakra(<Link href="/test">Click me</Link>);
      expect(screen.getByRole("link")).toHaveTextContent("Click me");
    });

    it("renders as an anchor element", () => {
      renderWithChakra(<Link href="/test">Link</Link>);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("has correct href attribute", () => {
      renderWithChakra(<Link href="/about">About</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("href", "/about");
    });
  });

  describe("external links", () => {
    it("opens in new tab when external prop is true", () => {
      renderWithChakra(
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
      renderWithChakra(<Link href="/test">Styled</Link>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-styled", "true");
    });
  });

  describe("accessibility", () => {
    it("supports aria-label", () => {
      renderWithChakra(
        <Link href="/test" aria-label="Go to test page">
          Test
        </Link>
      );
      expect(screen.getByLabelText("Go to test page")).toBeInTheDocument();
    });
  });
});

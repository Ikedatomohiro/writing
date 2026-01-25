import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Tag } from "./Tag";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Tag", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      renderWithChakra(<Tag>Category</Tag>);
      expect(screen.getByText("Category")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies default variant by default", () => {
      renderWithChakra(<Tag>Default</Tag>);
      const tag = screen.getByText("Default");
      expect(tag).toHaveAttribute("data-variant", "default");
    });

    it("applies category variant", () => {
      renderWithChakra(<Tag variant="category">Category</Tag>);
      const tag = screen.getByText("Category");
      expect(tag).toHaveAttribute("data-variant", "category");
    });
  });

  describe("sizes", () => {
    it("applies md size by default", () => {
      renderWithChakra(<Tag>Medium</Tag>);
      const tag = screen.getByText("Medium");
      expect(tag).toHaveAttribute("data-size", "md");
    });

    it("applies sm size", () => {
      renderWithChakra(<Tag size="sm">Small</Tag>);
      const tag = screen.getByText("Small");
      expect(tag).toHaveAttribute("data-size", "sm");
    });
  });

  describe("accessibility", () => {
    it("renders as a span element", () => {
      renderWithChakra(<Tag>Tag</Tag>);
      const tag = screen.getByText("Tag");
      expect(tag.tagName).toBe("SPAN");
    });
  });
});

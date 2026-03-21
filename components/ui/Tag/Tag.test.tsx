import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Tag } from "./Tag";

afterEach(() => {
  cleanup();
});

describe("Tag", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Tag>Category</Tag>);
      expect(screen.getByText("Category")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies default variant by default", () => {
      render(<Tag>Default</Tag>);
      const tag = screen.getByText("Default");
      expect(tag).toHaveAttribute("data-variant", "default");
    });

    it("applies category variant", () => {
      render(<Tag variant="category">Category</Tag>);
      const tag = screen.getByText("Category");
      expect(tag).toHaveAttribute("data-variant", "category");
    });
  });

  describe("sizes", () => {
    it("applies md size by default", () => {
      render(<Tag>Medium</Tag>);
      const tag = screen.getByText("Medium");
      expect(tag).toHaveAttribute("data-size", "md");
    });

    it("applies sm size", () => {
      render(<Tag size="sm">Small</Tag>);
      const tag = screen.getByText("Small");
      expect(tag).toHaveAttribute("data-size", "sm");
    });
  });

  describe("accessibility", () => {
    it("renders as a span element", () => {
      render(<Tag>Tag</Tag>);
      const tag = screen.getByText("Tag");
      expect(tag.tagName).toBe("SPAN");
    });
  });
});

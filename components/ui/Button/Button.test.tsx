import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Button } from "./Button";

afterEach(() => {
  cleanup();
});

describe("Button", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("renders as a button element by default", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies primary variant by default", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "primary");
    });

    it("applies secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "secondary");
    });

    it("applies ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "ghost");
    });
  });

  describe("sizes", () => {
    it("applies md size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "md");
    });

    it("applies sm size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "sm");
    });

    it("applies lg size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "lg");
    });
  });

  describe("states", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("shows loading spinner when loading prop is true", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
      expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("supports aria-label", () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      expect(screen.getByLabelText("Submit form")).toBeInTheDocument();
    });

    it("has correct type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });
});

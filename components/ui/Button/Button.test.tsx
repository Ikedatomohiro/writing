import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Button } from "./Button";

afterEach(() => {
  cleanup();
});

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("Button", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      renderWithChakra(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("renders as a button element by default", () => {
      renderWithChakra(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies primary variant by default", () => {
      renderWithChakra(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "primary");
    });

    it("applies secondary variant", () => {
      renderWithChakra(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "secondary");
    });

    it("applies ghost variant", () => {
      renderWithChakra(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "ghost");
    });
  });

  describe("sizes", () => {
    it("applies md size by default", () => {
      renderWithChakra(<Button>Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "md");
    });

    it("applies sm size", () => {
      renderWithChakra(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "sm");
    });

    it("applies lg size", () => {
      renderWithChakra(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "lg");
    });
  });

  describe("states", () => {
    it("is disabled when disabled prop is true", () => {
      renderWithChakra(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("shows loading spinner when loading prop is true", () => {
      renderWithChakra(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
      expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn();
      renderWithChakra(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const handleClick = vi.fn();
      renderWithChakra(
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
      renderWithChakra(<Button aria-label="Submit form">Submit</Button>);
      expect(screen.getByLabelText("Submit form")).toBeInTheDocument();
    });

    it("has correct type attribute", () => {
      renderWithChakra(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });
});

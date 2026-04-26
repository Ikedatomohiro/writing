import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AuthorByline } from "./AuthorByline";

afterEach(() => {
  cleanup();
});

describe("AuthorByline", () => {
  it("renders author name", () => {
    render(<AuthorByline name="pao.cho" href="/about" />);
    expect(screen.getByText("pao.cho")).toBeInTheDocument();
  });

  it("renders a link to /about", () => {
    render(<AuthorByline name="pao.cho" href="/about" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("wraps author name in the link", () => {
    render(<AuthorByline name="pao.cho" href="/about" />);
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("pao.cho");
  });

  it("renders with data-testid for author byline", () => {
    render(<AuthorByline name="pao.cho" href="/about" />);
    expect(screen.getByTestId("author-byline")).toBeInTheDocument();
  });

  it("renders custom className when provided", () => {
    render(<AuthorByline name="pao.cho" href="/about" className="custom-class" />);
    expect(screen.getByTestId("author-byline")).toHaveClass("custom-class");
  });
});

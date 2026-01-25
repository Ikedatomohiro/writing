import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeScript } from "./ThemeScript";

describe("ThemeScript", () => {
  it("renders a script tag", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script).not.toBeNull();
  });

  it("contains theme detection logic for /tech path", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain("startsWith('/tech')");
    expect(script?.innerHTML).toContain("theme = 'programming'");
  });

  it("contains theme detection logic for /health path", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain("startsWith('/health')");
    expect(script?.innerHTML).toContain("theme = 'health'");
  });

  it("contains theme detection logic for /asset path", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain("startsWith('/asset')");
  });

  it("sets default theme to investment", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain("var theme = 'investment'");
  });

  it("sets data-theme attribute on body", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");

    expect(script?.innerHTML).toContain(
      "document.body.setAttribute('data-theme', theme)"
    );
  });
});

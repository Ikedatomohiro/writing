import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("ThemeProvider", () => {
  beforeEach(() => {
    // Reset body attributes before each test
    document.body.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sets data-theme to 'investment' for /asset path", () => {
    vi.mocked(usePathname).mockReturnValue("/asset");

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.body.getAttribute("data-theme")).toBe("investment");
  });

  it("sets data-theme to 'programming' for /tech path", () => {
    vi.mocked(usePathname).mockReturnValue("/tech");

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.body.getAttribute("data-theme")).toBe("programming");
  });

  it("sets data-theme to 'health' for /health path", () => {
    vi.mocked(usePathname).mockReturnValue("/health");

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.body.getAttribute("data-theme")).toBe("health");
  });

  it("sets data-theme to 'investment' for root path", () => {
    vi.mocked(usePathname).mockReturnValue("/");

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.body.getAttribute("data-theme")).toBe("investment");
  });

  it("renders children correctly", () => {
    vi.mocked(usePathname).mockReturnValue("/");

    const { getByText } = render(
      <ThemeProvider>
        <div>Child content</div>
      </ThemeProvider>
    );

    expect(getByText("Child content")).toBeInTheDocument();
  });
});

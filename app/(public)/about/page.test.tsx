import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AboutPage from "./page";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AboutPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the hero section with h1", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders 'このブログについて' label", () => {
    render(<AboutPage />);
    const elements = screen.getAllByText("このブログについて");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the profile section heading", () => {
    render(<AboutPage />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    const profileHeading = headings.find(
      (h) => h.textContent === "書き手について"
    );
    expect(profileHeading).toBeDefined();
  });

  it("renders the author name", () => {
    render(<AboutPage />);
    const elements = screen.getAllByText(/松本翔/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the CTA section with contact link", () => {
    render(<AboutPage />);
    const contactLinks = screen.getAllByText("お問い合わせ");
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    const link = contactLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("does not render fictional team members", () => {
    render(<AboutPage />);
    expect(screen.queryByText("Sarah Jenkins")).toBeNull();
    expect(screen.queryByText("Marcus Chen")).toBeNull();
    expect(screen.queryByText("Elena Rodriguez")).toBeNull();
  });
});

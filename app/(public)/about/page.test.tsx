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

  it("renders the hero section with title", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent(/The Editorial/);
  });

  it("renders 'Our Origin Story' label", () => {
    render(<AboutPage />);
    const elements = screen.getAllByText("Our Origin Story");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the mission section heading", () => {
    render(<AboutPage />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    const missionHeading = headings.find(
      (h) => h.textContent === "Our Mission"
    );
    expect(missionHeading).toBeDefined();
  });

  it("renders all team member names", () => {
    render(<AboutPage />);
    expect(screen.getAllByText("Sarah Jenkins").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Marcus Chen").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Elena Rodriguez").length).toBeGreaterThanOrEqual(1);
  });

  it("renders team member roles", () => {
    render(<AboutPage />);
    expect(screen.getAllByText("Editor-in-Chief").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Principal Architect").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lead Analyst").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the editorial board section heading", () => {
    render(<AboutPage />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    const boardHeading = headings.find(
      (h) => h.textContent === "Meet the Editorial Board"
    );
    expect(boardHeading).toBeDefined();
  });

  it("renders the CTA section with contact link", () => {
    render(<AboutPage />);
    const contactLinks = screen.getAllByText("Contact for Collaborations");
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    const link = contactLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders team member initials as image placeholders", () => {
    render(<AboutPage />);
    expect(screen.getAllByText("SJ").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("MC").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ER").length).toBeGreaterThanOrEqual(1);
  });
});

import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { Footer } from "./Footer";
import { SITE_CONFIG } from "@/lib/constants/site";

afterEach(() => {
  cleanup();
});

describe("Footer", () => {
  it("ロゴ名が表示される", () => {
    render(<Footer />);
    expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
  });

  it("サブタイトルが表示される", () => {
    render(<Footer />);
    expect(screen.getByText("The Editorial Manuscript.")).toBeInTheDocument();
  });

  it("フッターリンクが表示される", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Careers")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Newsletter")).toBeInTheDocument();
  });

  it("フッターリンクが正しいhrefを持つ", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Careers" })).toHaveAttribute("href", "/careers");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Newsletter" })).toHaveAttribute("href", "/newsletter");
  });

  it("コピーライトが表示される", () => {
    render(<Footer />);
    const escapedName = SITE_CONFIG.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(
      screen.getByText(new RegExp(`© \\d{4} ${escapedName}\\. All rights reserved\\.`))
    ).toBeInTheDocument();
  });

  it("ソーシャルアイコンが表示される", () => {
    render(<Footer />);
    expect(screen.getByLabelText("RSS Feed")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("footer要素としてレンダリングされる", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

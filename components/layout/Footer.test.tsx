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

  it("サイト説明文が表示される", () => {
    render(<Footer />);
    expect(screen.getByText(SITE_CONFIG.description)).toBeInTheDocument();
  });

  it("カテゴリセクションが表示される", () => {
    render(<Footer />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Investment")).toBeInTheDocument();
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
  });

  it("リンクセクションが表示される", () => {
    render(<Footer />);
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("コピーライトが表示される", () => {
    render(<Footer />);
    const escapedName = SITE_CONFIG.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(
      screen.getByText(new RegExp(`© \\d{4} ${escapedName}\\. All rights reserved\\.`))
    ).toBeInTheDocument();
  });

  it("カテゴリリンクが正しいhrefを持つ", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Investment" })).toHaveAttribute(
      "href",
      "/asset"
    );
    expect(screen.getByRole("link", { name: "Programming" })).toHaveAttribute(
      "href",
      "/tech"
    );
    expect(screen.getByRole("link", { name: "Health" })).toHaveAttribute(
      "href",
      "/health"
    );
  });

  it("footer要素としてレンダリングされる", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

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

  it("サブタイトルが日本語で表示される", () => {
    render(<Footer />);
    expect(screen.getByText("知見を綴る、ひとりの時間。")).toBeInTheDocument();
  });

  it("フッターリンクが日本語で表示される", () => {
    render(<Footer />);
    expect(screen.getByText("運営者について")).toBeInTheDocument();
    expect(screen.getByText("プライバシーポリシー")).toBeInTheDocument();
    expect(screen.getByText("利用規約")).toBeInTheDocument();
    expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
  });

  it("採用情報・ニュースレターリンクが削除されている", () => {
    render(<Footer />);
    expect(screen.queryByText("採用情報")).toBeNull();
    expect(screen.queryByText("ニュースレター")).toBeNull();
  });

  it("フッターリンクが正しいhrefを持つ", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "運営者について" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "プライバシーポリシー" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "利用規約" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "お問い合わせ" })).toHaveAttribute("href", "/contact");
  });

  it("コピーライトが表示される", () => {
    render(<Footer />);
    const escapedName = SITE_CONFIG.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(
      screen.getByText(new RegExp(`© \\d{4} ${escapedName}\\. All rights reserved\\.`))
    ).toBeInTheDocument();
  });

  it("Emailソーシャルアイコンが表示される", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("footer要素としてレンダリングされる", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

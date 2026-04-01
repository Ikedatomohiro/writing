import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TermsPage from "./page";

afterEach(() => {
  cleanup();
});

describe("TermsPage", () => {
  it("利用規約の見出しが表示される", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "利用規約"
    );
  });

  it("サイト名「おひとりさまライフ」が表示される", () => {
    render(<TermsPage />);
    const elements = screen.getAllByText(/おひとりさまライフ/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("適用範囲セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /適用範囲/ })
    ).toBeInTheDocument();
  });

  it("禁止事項セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /禁止事項/ })
    ).toBeInTheDocument();
  });

  it("知的財産権セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /知的財産権/ })
    ).toBeInTheDocument();
  });

  it("免責事項セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /免責事項/ })
    ).toBeInTheDocument();
  });

  it("リンクについてセクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /リンクについて/ })
    ).toBeInTheDocument();
  });

  it("準拠法・管轄裁判所セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /準拠法・管轄裁判所/ })
    ).toBeInTheDocument();
  });

  it("利用規約の変更セクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /利用規約の変更/ })
    ).toBeInTheDocument();
  });

  it("お問い合わせセクションが表示される", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /お問い合わせ/ })
    ).toBeInTheDocument();
  });

  it("お問い合わせページへのリンクが含まれる", () => {
    render(<TermsPage />);
    const contactLink = screen.getByRole("link", {
      name: /お問い合わせページ/,
    });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("プライバシーポリシーページへのリンクが含まれる", () => {
    render(<TermsPage />);
    const privacyLink = screen.getByRole("link", {
      name: /プライバシーポリシー/,
    });
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  describe("制定日・改定日", () => {
    it("制定日が表示される", () => {
      render(<TermsPage />);
      expect(screen.getByText(/制定日/)).toBeInTheDocument();
    });
  });
});

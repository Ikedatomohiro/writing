import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TermsPage, { metadata } from "./page";
import { SITE_CONFIG } from "@/lib/constants/site";

afterEach(() => {
  cleanup();
});

describe("TermsPage", () => {
  describe("metadata", () => {
    it("titleが「利用規約」である", () => {
      expect(metadata.title).toBe("利用規約");
    });

    it("alternates.canonicalが「/terms」である", () => {
      expect(metadata.alternates.canonical).toBe("/terms");
    });
  });

  it("利用規約の見出しが表示される", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "利用規約"
    );
  });

  it("サイト名が表示される", () => {
    render(<TermsPage />);
    const element = screen.getByRole("heading", { level: 1 });
    expect(element).toBeInTheDocument();
    expect(document.body.textContent).toContain(SITE_CONFIG.name);
  });

  describe("8つのセクション", () => {
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

    it("免責事項セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /免責事項/ })
      ).toBeInTheDocument();
    });

    it("著作権セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /著作権/ })
      ).toBeInTheDocument();
    });

    it("リンクについてセクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /リンクについて/ })
      ).toBeInTheDocument();
    });

    it("プライバシーポリシーセクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /プライバシーポリシー/ })
      ).toBeInTheDocument();
    });

    it("規約の変更セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /規約の変更/ })
      ).toBeInTheDocument();
    });

    it("お問い合わせセクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /お問い合わせ/ })
      ).toBeInTheDocument();
    });
  });

  describe("リンク", () => {
    it("お問い合わせページへのリンクが含まれる", () => {
      render(<TermsPage />);
      const contactLink = screen.getByRole("link", {
        name: /お問い合わせページ/,
      });
      expect(contactLink).toHaveAttribute("href", "/contact");
    });

    it("プライバシーポリシーページへのリンクが含まれる", () => {
      render(<TermsPage />);
      const privacyLinks = screen.getAllByRole("link", {
        name: /プライバシーポリシー/,
      });
      const exactLink = privacyLinks.find(
        (link) => link.textContent === "プライバシーポリシー"
      );
      expect(exactLink).toBeDefined();
      expect(exactLink).toHaveAttribute("href", "/privacy");
    });
  });

  describe("制定日・改定日", () => {
    it("制定日が表示される", () => {
      render(<TermsPage />);
      expect(screen.getByText(/制定日/)).toBeInTheDocument();
    });

    it("最終改定日が表示される", () => {
      render(<TermsPage />);
      expect(screen.getByText(/最終改定日/)).toBeInTheDocument();
    });
  });

  describe("追加セクション（AdSense審査対応）", () => {
    it("利用条件セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /利用条件/ })
      ).toBeInTheDocument();
    });

    it("広告の掲載セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /広告の掲載/ })
      ).toBeInTheDocument();
    });

    it("広告の掲載セクションにAdSenseの記述が含まれる", () => {
      render(<TermsPage />);
      const elements = screen.getAllByText(/AdSense/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("広告の掲載セクションにCookieの記述が含まれる", () => {
      render(<TermsPage />);
      const elements = screen.getAllByText(/Cookie/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("準拠法・管轄セクションが表示される", () => {
      render(<TermsPage />);
      expect(
        screen.getByRole("heading", { name: /準拠法/ })
      ).toBeInTheDocument();
    });

    it("準拠法セクションに日本法の記述が含まれる", () => {
      render(<TermsPage />);
      expect(document.body.textContent).toMatch(/日本法|日本の法令/);
    });

    it("準拠法セクションに管轄裁判所の記述が含まれる", () => {
      render(<TermsPage />);
      expect(document.body.textContent).toMatch(/東京|管轄裁判所/);
    });
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ProfilePage, { metadata } from "./page";
import { SITE_CONFIG } from "@/lib/constants/site";

afterEach(() => {
  cleanup();
});

describe("ProfilePage", () => {
  describe("metadata", () => {
    it("titleが「プロフィール」である", () => {
      expect(metadata.title).toBe("プロフィール");
    });

    it("alternates.canonicalが「/profile」である", () => {
      expect(metadata.alternates.canonical).toBe("/profile");
    });
  });

  it("プロフィールの見出しが表示される", () => {
    render(<ProfilePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "プロフィール"
    );
  });

  it("サイト名が表示される", () => {
    render(<ProfilePage />);
    expect(document.body.textContent).toContain(SITE_CONFIG.name);
  });

  describe("セクション見出し", () => {
    it("自己紹介セクションが表示される", () => {
      render(<ProfilePage />);
      expect(
        screen.getByRole("heading", { name: /自己紹介/ })
      ).toBeInTheDocument();
    });

    it("経歴セクションが表示される", () => {
      render(<ProfilePage />);
      expect(
        screen.getByRole("heading", { name: /経歴/ })
      ).toBeInTheDocument();
    });

    it("ブログについてセクションが表示される", () => {
      render(<ProfilePage />);
      expect(
        screen.getByRole("heading", { name: /ブログについて/ })
      ).toBeInTheDocument();
    });
  });

  describe("リンク", () => {
    it("お問い合わせページへのリンクが含まれる", () => {
      render(<ProfilePage />);
      const contactLink = screen.getByRole("link", {
        name: /お問い合わせ/,
      });
      expect(contactLink).toHaveAttribute("href", "/contact");
    });
  });
});

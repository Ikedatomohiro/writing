import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PrivacyPolicyPage from "./page";

afterEach(() => {
  cleanup();
});

describe("PrivacyPolicyPage", () => {
  it("プライバシーポリシーの見出しが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "プライバシーポリシー"
    );
  });

  it("個人情報の取得についてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /個人情報の取得について/ })
    ).toBeInTheDocument();
  });

  it("アクセス解析ツールについてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /アクセス解析ツールについて/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Analytics/)).toBeInTheDocument();
  });

  it("広告配信についてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /広告配信について/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Adsense/)).toBeInTheDocument();
  });

  it("Amazonアソシエイトについてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /Amazonアソシエイトについて/ })
    ).toBeInTheDocument();
  });

  it("Amazonアソシエイトの必須文言が含まれる", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(
        /Amazon\.co\.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です/
      )
    ).toBeInTheDocument();
  });

  it("個人情報の第三者提供についてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /個人情報の第三者提供について/ })
    ).toBeInTheDocument();
  });

  it("お問い合わせセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /お問い合わせ/ })
    ).toBeInTheDocument();
  });

  it("プライバシーポリシーの変更についてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /プライバシーポリシーの変更について/ })
    ).toBeInTheDocument();
  });

  it("Googleプライバシーポリシーへのリンクが含まれる", () => {
    render(<PrivacyPolicyPage />);
    const googlePolicyLink = screen.getByRole("link", {
      name: /Googleプライバシーポリシー/,
    });
    expect(googlePolicyLink).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy"
    );
  });

  it("広告設定へのリンクが含まれる", () => {
    render(<PrivacyPolicyPage />);
    const adSettingsLink = screen.getByRole("link", { name: /広告設定/ });
    expect(adSettingsLink).toHaveAttribute(
      "href",
      "https://www.google.com/settings/ads"
    );
  });

  it("お問い合わせページへのリンクが含まれる", () => {
    render(<PrivacyPolicyPage />);
    const contactLink = screen.getByRole("link", {
      name: /お問い合わせページ/,
    });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });
});

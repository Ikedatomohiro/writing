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
    const elements = screen.getAllByText(/Google Analytics/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("広告配信についてのセクションが表示される", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /広告配信について/ })
    ).toBeInTheDocument();
    const elements = screen.getAllByText(/Google Adsense/i);
    expect(elements.length).toBeGreaterThan(0);
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

  // Issue #55: 新規追加テスト
  describe("運営者情報", () => {
    it("サイト名「おひとりさまライフ」が表示される", () => {
      render(<PrivacyPolicyPage />);
      const elements = screen.getAllByText(/おひとりさまライフ/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("制定日・改定日", () => {
    it("制定日が2026年1月28日と表示される", () => {
      render(<PrivacyPolicyPage />);
      expect(screen.getByText(/制定日.*2026年1月28日/)).toBeInTheDocument();
    });
  });

  describe("免責事項・著作権", () => {
    it("免責事項セクションが表示される", () => {
      render(<PrivacyPolicyPage />);
      expect(
        screen.getByRole("heading", { name: /免責事項/ })
      ).toBeInTheDocument();
    });

    it("著作権セクションが表示される", () => {
      render(<PrivacyPolicyPage />);
      expect(
        screen.getByRole("heading", { name: /著作権/ })
      ).toBeInTheDocument();
    });
  });

  describe("改正電気通信事業法対応", () => {
    it("外部送信規律に関するセクションが表示される", () => {
      render(<PrivacyPolicyPage />);
      expect(
        screen.getByRole("heading", { name: /外部送信/ })
      ).toBeInTheDocument();
    });
  });

  describe("Google AdSense詳細", () => {
    it("パーソナライズ広告についての説明が含まれる", () => {
      render(<PrivacyPolicyPage />);
      const elements = screen.getAllByText(/パーソナライズ/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("Cookie無効化の方法が説明されている", () => {
      render(<PrivacyPolicyPage />);
      const elements = screen.getAllByText(/Cookieを無効/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NewsletterSignup } from "./NewsletterSignup";

afterEach(() => {
  cleanup();
});

describe("NewsletterSignup", () => {
  describe("rendering", () => {
    it("renders with correct data-testid", () => {
      render(<NewsletterSignup />);
      expect(screen.getByTestId("newsletter-signup")).toBeInTheDocument();
    });

    it("renders default title", () => {
      render(<NewsletterSignup />);
      expect(screen.getByText("ニュースレター")).toBeInTheDocument();
    });

    it("renders default description", () => {
      render(<NewsletterSignup />);
      expect(
        screen.getByText("最新記事をメールでお届けします。")
      ).toBeInTheDocument();
    });

    it("renders custom title and description", () => {
      render(
        <NewsletterSignup
          title="メルマガ登録"
          description="週刊でお届け"
        />
      );
      expect(screen.getByText("メルマガ登録")).toBeInTheDocument();
      expect(screen.getByText("週刊でお届け")).toBeInTheDocument();
    });

    it("renders email input", () => {
      render(<NewsletterSignup />);
      expect(
        screen.getByPlaceholderText("メールアドレス")
      ).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<NewsletterSignup />);
      expect(
        screen.getByRole("button", { name: "登録する" })
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has section role", () => {
      render(<NewsletterSignup />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("has correct aria-label", () => {
      render(<NewsletterSignup />);
      expect(screen.getByLabelText("ニュースレター")).toBeInTheDocument();
    });

    it("email input has aria-label", () => {
      render(<NewsletterSignup />);
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });
  });
});

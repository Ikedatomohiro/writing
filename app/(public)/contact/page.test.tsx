import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ContactPage from "./page";
import { ContactForm } from "./ContactForm";

vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

describe("ContactPage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the page title in Japanese", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("heading", { name: /お問い合わせ/i })
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<ContactPage />);
    expect(
      screen.getByText(/運営へのご質問やフィードバック/i)
    ).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders form fields in Japanese", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText("山田 太郎")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("taro@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("どのようなご用件でしょうか？")
    ).toBeInTheDocument();
    expect(screen.getByText("メッセージを送信")).toBeInTheDocument();
  });

  it("renders subject dropdown with Japanese options", () => {
    render(<ContactForm />);
    expect(screen.getByText("一般")).toBeInTheDocument();
    expect(screen.getByText("記事について")).toBeInTheDocument();
    expect(screen.getByText("不具合報告")).toBeInTheDocument();
  });
});

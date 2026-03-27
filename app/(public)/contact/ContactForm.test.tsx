import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all form fields", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText("山田 太郎")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("taro@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("どのようなご用件でしょうか？")
    ).toBeInTheDocument();
  });

  it("renders subject select with options", () => {
    render(<ContactForm />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "一般",
      "記事について",
      "不具合報告",
      "その他",
    ]);
  });

  it("renders submit button with correct text", () => {
    render(<ContactForm />);
    const button = screen.getByText("メッセージを送信");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  function fillAndSubmitForm() {
    fireEvent.change(screen.getByPlaceholderText("山田 太郎"), {
      target: { value: "テスト太郎" },
    });
    fireEvent.change(screen.getByPlaceholderText("taro@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("どのようなご用件でしょうか？"),
      { target: { value: "テストメッセージ" } }
    );
    fireEvent.click(screen.getByText("メッセージを送信"));
  }

  it("shows success message after successful submission", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    render(<ContactForm />);
    fillAndSubmitForm();

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toBeInTheDocument();
    });
    expect(screen.getByText("送信が完了しました")).toBeInTheDocument();
  });

  it("shows error message on failed submission", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "サーバーエラー" }), {
        status: 500,
      })
    );

    render(<ContactForm />);
    fillAndSubmitForm();

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
    expect(screen.getByText("サーバーエラー")).toBeInTheDocument();
  });

  it("shows sending state while submitting", async () => {
    let resolvePromise: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });
    vi.spyOn(global, "fetch").mockReturnValue(fetchPromise);

    render(<ContactForm />);
    fillAndSubmitForm();

    await waitFor(() => {
      expect(screen.getByText("送信中...")).toBeInTheDocument();
    });
    const button = screen.getByText("送信中...");
    expect(button).toBeDisabled();

    resolvePromise!(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
  });

  it("shows error message on network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    render(<ContactForm />);
    fillAndSubmitForm();

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});

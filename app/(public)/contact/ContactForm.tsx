"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "送信に失敗しました"
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12" data-testid="success-message">
        <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
          check_circle
        </span>
        <h3 className="text-xl font-bold font-headline mb-2">
          送信が完了しました
        </h3>
        <p className="text-on-surface-variant">
          お問い合わせいただきありがとうございます。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            お名前 (Name)
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="山田 太郎"
            className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline"
          />
        </div>
        <div className="space-y-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            メールアドレス (Email Address)
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="taro@example.com"
            className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
          お問い合わせ項目 (Subject)
        </label>
        <select
          name="subject"
          required
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface appearance-none"
        >
          <option value="一般">一般</option>
          <option value="記事について">記事について</option>
          <option value="不具合報告">不具合報告</option>
          <option value="その他">その他</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
          メッセージ (Message)
        </label>
        <textarea
          name="message"
          required
          placeholder="どのようなご用件でしょうか？"
          rows={6}
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-outline resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-error text-sm" data-testid="error-message">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-10 py-4 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        {status === "sending" ? "送信中..." : "メッセージを送信"}
      </button>
    </form>
  );
}

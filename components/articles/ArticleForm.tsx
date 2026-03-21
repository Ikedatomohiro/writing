"use client";

import { useState } from "react";
import type { Article, ArticleStatus } from "@/lib/articles/types";

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: {
    title: string;
    content: string;
    keywords: string[];
    status: ArticleStatus;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
  { value: "archived", label: "アーカイブ" },
];

export function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [keywords, setKeywords] = useState<string[]>(article?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState<ArticleStatus>(
    article?.status ?? "draft"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, keywords, status });
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold font-headline text-on-surface">
        {article ? "記事を編集" : "新規記事作成"}
      </h2>

      <FormField label="タイトル">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事のタイトルを入力"
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline"
        />
      </FormField>

      <FormField label="本文">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="記事の本文を入力"
          rows={15}
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline resize-y"
        />
      </FormField>

      <FormField label="キーワード">
        <div className="flex gap-2">
          <input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="キーワードを入力してEnter"
            className="flex-1 bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors text-sm font-medium"
          >
            追加
          </button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-medium"
              >
                {keyword}
                <button
                  type="button"
                  aria-label={`${keyword}を削除`}
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </span>
            ))}
          </div>
        )}
      </FormField>

      <FormField label="ステータス">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={
                status === option.value
                  ? "px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium"
                  : "px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </FormField>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-sm font-medium"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? "保存中..." : article ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

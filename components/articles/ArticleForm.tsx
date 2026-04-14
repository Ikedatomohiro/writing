"use client";

import { useState } from "react";
import type { Article, Category } from "@/lib/content/types";
import type { ArticleCreateInput } from "@/lib/content/repository";
import { HIDDEN_CATEGORIES } from "@/lib/constants/site";

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: ArticleCreateInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const BASE_CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "tech", label: "プログラミング" },
  { value: "asset", label: "資産形成" },
  { value: "health", label: "健康" },
];

// 非公開カテゴリは「（非公開）」ラベルを付けて選択可能にする
const CATEGORY_OPTIONS = BASE_CATEGORY_OPTIONS.map((opt) => ({
  ...opt,
  label: HIDDEN_CATEGORIES.has(opt.value)
    ? `${opt.label}（非公開）`
    : opt.label,
}));

export function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState<Category>(
    article?.category ?? "tech"
  );
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [thumbnail, setThumbnail] = useState(article?.thumbnail ?? "");
  const [published, setPublished] = useState(article?.published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      content,
      category,
      tags,
      thumbnail: thumbnail || undefined,
      published,
    });
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
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
          required
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline"
        />
      </FormField>

      <FormField label="説明">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="記事の概要を入力"
          required
          rows={3}
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline resize-y"
        />
      </FormField>

      <FormField label="カテゴリ">
        <div className="flex gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={
                category === option.value
                  ? "px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium"
                  : "px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="本文（MDX）">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="記事の本文を入力（MDX形式）"
          rows={15}
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline resize-y font-mono text-sm"
        />
      </FormField>

      <FormField label="タグ">
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="タグを入力してEnter"
            className="flex-1 bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors text-sm font-medium"
          >
            追加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`${tag}を削除`}
                  onClick={() => removeTag(tag)}
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

      <FormField label="サムネイルURL">
        <input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://example.com/image.jpg"
          type="url"
          className="w-full bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-outline"
        />
      </FormField>

      <FormField label="公開状態">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <span className="text-sm text-on-surface">
            {published ? "公開" : "下書き"}
          </span>
        </label>
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

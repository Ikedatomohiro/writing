"use client";

import { useEffect, useRef } from "react";
import { X_CHAR_LIMIT, countXChars } from "@/lib/types/x";

interface XPostEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function XPostEditor({ value, onChange, disabled = false }: XPostEditorProps) {
  const isOverLimit = countXChars(value) > X_CHAR_LIMIT;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        aria-label="投稿本文"
        aria-invalid={isOverLimit ? "true" : undefined}
        aria-describedby={isOverLimit ? "x-char-count-error" : undefined}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 overflow-hidden min-h-[72px]"
      />
      <div className="flex justify-end">
        <span
          data-testid="x-char-count"
          id={isOverLimit ? "x-char-count-error" : undefined}
          className={`text-xs font-mono ${isOverLimit ? "text-red-600 font-bold" : "text-slate-500"}`}
        >
          {countXChars(value)}/{X_CHAR_LIMIT}
        </span>
      </div>
    </div>
  );
}

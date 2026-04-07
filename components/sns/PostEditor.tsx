import { useEffect, useRef } from "react";
import type { SnsPostType } from "@/lib/types/sns";

const POST_TYPES: SnsPostType[] = ["normal", "comment_hook", "thread", "affiliate"];
const MAX_CHARS = 500;

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  type: SnsPostType;
  onTypeChange: (type: SnsPostType) => void;
  disabled?: boolean;
}

export function PostEditor({
  value,
  onChange,
  type,
  onTypeChange,
  disabled = false,
}: PostEditorProps) {
  const isOverLimit = value.length > MAX_CHARS;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキスト量に合わせて高さを自動調整
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
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 overflow-hidden min-h-[72px]"
      />
      <div className="flex items-center justify-between">
        <select
          data-testid="type-select"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as SnsPostType)}
          disabled={disabled}
          className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
        >
          {POST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span
          data-testid="char-count"
          className={`text-xs font-mono ${isOverLimit ? "text-red-600 font-bold" : "text-slate-500"}`}
        >
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

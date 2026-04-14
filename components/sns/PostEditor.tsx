import { useEffect, useId, useRef } from "react";
import type { SnsPostType } from "@/lib/types/sns";
import { POST_TYPE_LABELS } from "@/lib/constants/labels";

const POST_TYPES: SnsPostType[] = ["normal", "comment_hook", "thread", "affiliate"];
const MAX_CHARS = 500;

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  type: SnsPostType;
  onTypeChange: (type: SnsPostType) => void;
  disabled?: boolean;
  label?: string;
}

export function PostEditor({
  value,
  onChange,
  type,
  onTypeChange,
  disabled = false,
  label,
}: PostEditorProps) {
  const isOverLimit = value.length > MAX_CHARS;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uid = useId();
  const typeSelectId = `${uid}-type`;
  const charCountId = `${uid}-char-count`;

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
        aria-label={label ?? "投稿本文"}
        aria-invalid={isOverLimit ? "true" : undefined}
        aria-describedby={isOverLimit ? charCountId : undefined}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 overflow-hidden min-h-[72px]"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor={typeSelectId} className="sr-only">投稿タイプ</label>
          <select
            id={typeSelectId}
            data-testid="type-select"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as SnsPostType)}
            disabled={disabled}
            className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {POST_TYPES.map((t) => (
              <option key={t} value={t}>
                {POST_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <span
          id={isOverLimit ? charCountId : undefined}
          data-testid="char-count"
          role={isOverLimit ? "alert" : undefined}
          aria-live={isOverLimit ? undefined : "polite"}
          className={`text-xs font-mono ${isOverLimit ? "text-red-600 font-bold" : "text-slate-600"}`}
        >
          {isOverLimit && <span className="mr-1">⚠</span>}
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

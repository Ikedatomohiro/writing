import type { SnsPostType } from "@/lib/types/sns";
import type { XCategory } from "@/lib/types/x";

export const ACCOUNT_LABELS: Record<string, string> = {
  "pao-pao-cho": "パオパオ長 (Threads/X)",
  "matsumoto_sho": "松本翔 (note/X)",
  "morita_rin": "森田凛",
} as const;

export const POST_TYPE_LABELS: Record<SnsPostType, string> = {
  normal: "通常",
  comment_hook: "コメント誘導",
  thread: "スレッド続き",
  affiliate: "アフィリエイト",
} as const;

export const X_CATEGORY_LABELS: Record<XCategory, string> = {
  note_article: "noteへの誘導",
  tech_tips: "テックTips",
  career: "キャリア",
  opinion: "意見・考察",
} as const;

export function getAccountLabel(account: string): string {
  return ACCOUNT_LABELS[account] ?? account;
}

export function getPostTypeLabel(type: SnsPostType): string {
  return POST_TYPE_LABELS[type];
}

export function getXCategoryLabel(category: XCategory | string): string {
  return (X_CATEGORY_LABELS as Record<string, string>)[category] ?? category;
}

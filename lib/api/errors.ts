/**
 * HTTP レスポンスと例外からユーザー向けエラーメッセージを生成する。
 * - 4xx: 入力内容確認を促す
 * - 5xx: 一時的な障害として再試行を促す
 * - network error (res == null): ネットワーク確認を促す
 */
export function formatApiError(res: Response | null, err: unknown): string {
  if (res === null) {
    return "ネットワーク接続を確認してください";
  }
  if (res.status >= 400 && res.status < 500) {
    return "入力内容を確認してください";
  }
  if (res.status >= 500) {
    return "一時的な障害です。数秒後に再試行してください";
  }
  // fallback
  void err;
  return "ネットワーク接続を確認してください";
}

/**
 * ホワイトリスト検証モジュール
 * 環境変数 ALLOWED_EMAILS に基づいてユーザーのアクセスを制御する
 */

/**
 * 許可されたメールアドレスのリストを取得
 * @returns 許可されたメールアドレスの配列
 */
export function getAllowedEmails(): string[] {
  const allowedEmails = process.env.ALLOWED_EMAILS ?? "";
  if (!allowedEmails.trim()) {
    return [];
  }
  return allowedEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * メールアドレスがホワイトリストに含まれているか検証
 * @param email - 検証するメールアドレス
 * @returns ホワイトリストに含まれている場合は true
 */
export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const allowedEmails = getAllowedEmails();
  if (allowedEmails.length === 0) {
    return false;
  }
  return allowedEmails.includes(email.toLowerCase());
}

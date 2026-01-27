/**
 * サイト全体の設定
 * サイト名やURL等の共通設定を一元管理する
 */
export const siteConfig = {
  /** サイト名 */
  name: "おひとりさまライフ",
  /** サイトの説明 */
  description: "ひとり暮らしを楽しむためのライフスタイルブログ",
  /** サイトのURL */
  url: "https://ohitorisama-life.com",
} as const;

export type SiteConfig = typeof siteConfig;

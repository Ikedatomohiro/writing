import { Noto_Sans_JP, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Noto Sans JP - 日本語フォント
 * 見出し・本文に使用
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
});

/**
 * Inter - 英数字フォント
 * 補助的なUI要素に使用
 */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/**
 * JetBrains Mono - モノスペースフォント
 * コードブロック・技術的なテキストに使用
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

/**
 * フォントCSS変数のクラス名（スペース区切り）
 * layout.tsxでhtml/bodyに適用する
 */
export const fontVariables = `${notoSansJP.variable} ${inter.variable} ${jetbrainsMono.variable}`;

/**
 * フォントクラス名（スペース区切り）
 * CSSクラスとして直接適用する場合に使用
 */
export const fontClassNames = `${notoSansJP.className} ${inter.className} ${jetbrainsMono.className}`;

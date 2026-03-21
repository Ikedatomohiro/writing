import { Manrope, Inter, Fira_Code, Noto_Sans_JP } from "next/font/google";

/**
 * Manrope - Headline font
 * Used for headings and display text
 */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * Inter - Body font
 * Used for body text, labels, and UI elements
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Fira Code - Monospace font
 * Used for code blocks and technical text
 */
export const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

/**
 * Noto Sans JP - Japanese font fallback
 * Used as fallback for Japanese text rendering
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
});

/**
 * Font CSS variable class names (space-separated)
 * Applied to html element in layout.tsx
 */
export const fontVariables = `${manrope.variable} ${inter.variable} ${firaCode.variable} ${notoSansJP.variable}`;

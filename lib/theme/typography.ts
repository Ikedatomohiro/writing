/**
 * Typography configuration based on design system
 * デザインシステムに基づくタイポグラフィ設定
 */

/**
 * Font sizes in rem units
 * デザインシステム定義:
 * - H1: 32px (2rem)
 * - H2: 24px (1.5rem)
 * - H3: 20px (1.25rem)
 * - H4: 18px (1.125rem)
 * - Body: 16px (1rem)
 * - Caption: 14px (0.875rem)
 * - Small: 12px (0.75rem)
 */
export const FONT_SIZES = {
  h1: "2rem",
  h2: "1.5rem",
  h3: "1.25rem",
  h4: "1.125rem",
  body: "1rem",
  caption: "0.875rem",
  small: "0.75rem",
} as const;

/**
 * Line heights for different text types
 */
export const LINE_HEIGHTS = {
  heading: "1.3",
  body: "1.75",
  caption: "1.5",
} as const;

/**
 * Font weights
 * デザインシステム定義:
 * - H1, H2: 700 (bold)
 * - H3, H4: 600 (semibold)
 * - Body, Caption, Small: 400 (normal)
 */
export const FONT_WEIGHTS = {
  h1: "700",
  h2: "700",
  h3: "600",
  h4: "600",
  body: "400",
  caption: "400",
  small: "400",
} as const;

/**
 * Typography style definitions
 * CSS-in-JS or inline style で使用可能な形式
 */
export const typography = {
  h1: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.h1,
    lineHeight: LINE_HEIGHTS.heading,
  },
  h2: {
    fontSize: FONT_SIZES.h2,
    fontWeight: FONT_WEIGHTS.h2,
    lineHeight: LINE_HEIGHTS.heading,
  },
  h3: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.h3,
    lineHeight: LINE_HEIGHTS.heading,
  },
  h4: {
    fontSize: FONT_SIZES.h4,
    fontWeight: FONT_WEIGHTS.h4,
    lineHeight: LINE_HEIGHTS.heading,
  },
  body: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  small: {
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.small,
    lineHeight: LINE_HEIGHTS.caption,
  },
} as const;

export type TypographyKey = keyof typeof typography;

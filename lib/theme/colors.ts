/**
 * Color tokens based on design system
 * デザインシステムに基づくカラートークン
 */

export const COLORS = {
  // Text colors
  textPrimary: "#1C1917",
  textSecondary: "#57534E",
  textMuted: "#A8A29E",

  // Background colors
  bgPrimary: "#FAFAF9",
  bgSurface: "#F5F5F4",
  bgCard: "#FFFFFF",

  // Border colors
  border: "#E7E5E4",
  borderStrong: "#D6D3D1",
} as const;

export type ColorKey = keyof typeof COLORS;

import type { Theme, ThemeConfig } from "./types";

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  investment: {
    theme: "investment",
    paths: ["/asset"],
    accent: "#0891B2",
    accentBg: "#ECFEFF",
  },
  programming: {
    theme: "programming",
    paths: ["/tech"],
    accent: "#7C3AED",
    accentBg: "#F5F3FF",
  },
  health: {
    theme: "health",
    paths: ["/health"],
    accent: "#16A34A",
    accentBg: "#F0FDF4",
  },
};

export const DEFAULT_THEME: Theme = "investment";

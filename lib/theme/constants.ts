import type { Theme, ThemeConfig } from "./types";

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  investment: {
    theme: "investment",
    paths: ["/asset"],
    accent: "#00478d",
    accentBg: "#ecedf6",
  },
  programming: {
    theme: "programming",
    paths: ["/tech"],
    accent: "#a9c7ff",
    accentBg: "#191c21",
  },
  health: {
    theme: "health",
    paths: ["/health"],
    accent: "#00478d",
    accentBg: "#f9f9ff",
  },
};

export const DEFAULT_THEME: Theme = "investment";

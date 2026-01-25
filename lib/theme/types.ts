export type Theme = "investment" | "programming" | "health";

export type CategoryPath = "/asset" | "/tech" | "/health";

export interface ThemeConfig {
  theme: Theme;
  paths: string[];
  accent: string;
  accentBg: string;
}

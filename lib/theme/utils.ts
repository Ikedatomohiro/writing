import type { Theme } from "./types";
import { THEME_CONFIGS, DEFAULT_THEME } from "./constants";

/**
 * URLパスからテーマを判定する
 * @param pathname - URLパス（例: "/asset/some-article"）
 * @returns テーマ名
 */
export function getThemeFromPath(pathname: string): Theme {
  for (const [theme, config] of Object.entries(THEME_CONFIGS)) {
    if (config.paths.some((path) => pathname.startsWith(path))) {
      return theme as Theme;
    }
  }
  return DEFAULT_THEME;
}

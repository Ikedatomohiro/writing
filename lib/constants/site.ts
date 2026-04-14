/**
 * サイト情報の定数
 */
export const SITE_CONFIG = {
  name: "Pogo Notes",
  description: "日々の気づきをまとめるノート",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pogo-notes.com",
  locale: "ja_JP",
  defaultOgImage: "/images/solo-life-hero.png",
} as const;

/**
 * AdSense対策で非表示にするカテゴリ（YMYL: Your Money Your Life）
 * 再表示する場合はここから除外し、CATEGORIESに戻す
 */
export const HIDDEN_CATEGORIES = new Set(["asset", "health"]);

/**
 * カテゴリの表示順（ここだけ変えれば全体に反映される）
 */
export const CATEGORIES = [
  { slug: "tech", label: "プログラミング", href: "/tech" },
] as const;

/**
 * カテゴリ情報
 */
export const CATEGORY_META = {
  asset: {
    title: "資産形成",
    description:
      "資産形成に関する記事を掲載しています。投資、節約、マネープランニングなど。",
  },
  tech: {
    title: "プログラミング",
    description:
      "プログラミングに関する記事を掲載しています。Web開発、AI、ツールなど。",
  },
  health: {
    title: "健康",
    description:
      "健康に関する記事を掲載しています。運動、食事、メンタルヘルスなど。",
  },
} as const;

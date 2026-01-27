/**
 * サイト情報の定数
 */
export const SITE_CONFIG = {
  name: "Writing",
  description: "資産形成・プログラミング・健康に関する情報を発信するブログ",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://writing.example.com",
  locale: "ja_JP",
  defaultOgImage: "/images/og-default.png",
} as const;

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

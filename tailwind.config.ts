import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ベースカラー（CSS変数を参照）
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        // テーマカラー（カテゴリ別、CSS変数を参照）
        accent: {
          DEFAULT: "var(--accent)",
          bg: "var(--accent-bg)",
        },
      },
      fontFamily: {
        // next/fontで設定したCSS変数を使用
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // 見出し
        h1: ["2rem", { lineHeight: "1.4", fontWeight: "700" }], // 32px
        h2: ["1.5rem", { lineHeight: "1.4", fontWeight: "700" }], // 24px
        h3: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }], // 20px
        h4: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }], // 18px
        // 本文
        body: ["1rem", { lineHeight: "1.8" }], // 16px
        caption: ["0.875rem", { lineHeight: "1.5" }], // 14px
        small: ["0.75rem", { lineHeight: "1.5" }], // 12px
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};

export default config;

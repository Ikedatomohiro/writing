import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_THEMES: Record<string, { bg: string; accent: string; label: string }> = {
  asset: { bg: "#ecedf6", accent: "#00478d", label: "資産形成" },
  tech: { bg: "#191c21", accent: "#a9c7ff", label: "プログラミング" },
  health: { bg: "#f9f9ff", accent: "#00478d", label: "健康" },
};

const DEFAULT_THEME = { bg: "#f9f9ff", accent: "#00478d", label: "" };

function truncateTitle(title: string, maxLen: number): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen - 1) + "…";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "ライフハック・ラボ — 生活改善の実験室";
  const category = searchParams.get("category") || "";
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const isDark = category === "tech";
  const displayTitle = truncateTitle(title, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: theme.bg,
          fontFamily: "'Noto Sans JP', 'Inter', sans-serif",
        }}
      >
        {/* Category badge */}
        {theme.label && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: theme.accent,
                color: isDark ? "#191c21" : "#ffffff",
                padding: "6px 20px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {theme.label}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: displayTitle.length > 20 ? "48px" : "56px",
              fontWeight: 800,
              color: isDark ? "#e1e2ea" : "#191c21",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              wordBreak: "break-word",
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: isDark ? "#a9c7ff" : theme.accent,
                letterSpacing: "-0.02em",
              }}
            >
              ライフハック・ラボ
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: isDark ? "#8c909e" : "#727783",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              The Editorial Manuscript
            </div>
          </div>

          {/* Decorative accent bar */}
          <div
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: theme.accent,
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

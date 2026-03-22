import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessRanking } from "./AccessRanking";

describe("AccessRanking", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ローディング中はローディング表示を出す", () => {
    vi.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {})
    );

    render(<AccessRanking />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("ランキングデータを表示する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ranking: [
          { path: "/asset/test", title: "テスト記事", pageViews: 1234 },
          { path: "/tech/react", title: "React入門", pageViews: 567 },
        ],
        period: { startDate: "2026-02-20", endDate: "2026-03-22" },
      }),
    } as Response);

    render(<AccessRanking />);

    expect(await screen.findByText("テスト記事")).toBeInTheDocument();
    expect(screen.getByText("React入門")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("567")).toBeInTheDocument();
  });

  it("ランキングが空の場合はメッセージを表示する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ranking: [],
        period: { startDate: "2026-02-20", endDate: "2026-03-22" },
      }),
    } as Response);

    render(<AccessRanking />);

    expect(
      await screen.findByText("データがありません")
    ).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    render(<AccessRanking />);

    expect(
      await screen.findByText("ランキングの取得に失敗しました")
    ).toBeInTheDocument();
  });
});

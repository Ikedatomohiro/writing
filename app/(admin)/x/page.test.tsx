import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import XPage from "./page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSeries = [
  {
    id: "x1",
    account: "pao-pao-cho",
    theme: "Xテストテーマ1",
    category: "note_article",
    quality_score: null,
    score_breakdown: null,
    status: "draft",
    queue_order: null,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    note_url: null,
    hashtags: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    posts: [
      {
        id: "xp1",
        series_id: "x1",
        position: 0,
        text: "X投稿テキスト",
        x_post_id: null,
        source_url: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      },
    ],
  },
];

describe("XPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSeries }),
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("ページタイトルを表示する", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "X管理" })).toBeInTheDocument();
    });
  });

  it("新規作成ボタンを表示する", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /新規作成/ })).toBeInTheDocument();
    });
  });

  it("アカウント切替ドロップダウンが表示される", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("デフォルトアカウントはpao-pao-choでfetch URLにaccount=pao-pao-choが含まれる", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("account=pao-pao-cho")
      );
    });
  });

  it("アカウント切替でfetch URLが変わる", async () => {
    const user = userEvent.setup();
    render(<XPage />);

    await waitFor(() => screen.getByRole("combobox"));
    await user.selectOptions(screen.getByRole("combobox"), "matsumoto_sho");

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=matsumoto_sho"))).toBe(true);
    });
  });

  it("ステータスタブが表示される", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "all" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "draft" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "queued" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "posted" })).toBeInTheDocument();
    });
  });

  it("シリーズ一覧が表示される", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByText("Xテストテーマ1")).toBeInTheDocument();
    });
  });
});

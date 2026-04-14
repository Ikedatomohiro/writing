import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SnsPage from "./page";
import { ToastProvider } from "@/components/common/ToastProvider";

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSeries = [
  {
    id: "1",
    theme: "テストテーマ1",
    pattern: "pattern-a",
    quality_score: 85,
    score_breakdown: null,
    status: "draft",
    queue_order: null,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    posts: [{ id: "p1", series_id: "1", position: 0, text: "テスト投稿テキスト", type: "normal", threads_post_id: null, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" }],
  },
  {
    id: "2",
    theme: "テストテーマ2",
    pattern: "pattern-b",
    quality_score: 90,
    score_breakdown: null,
    status: "queued",
    queue_order: 1,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
    posts: [],
  },
];

describe("SnsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSeries }),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("ページタイトルを表示する", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Threads管理" })).toBeInTheDocument();
    });
  });

  it("新規作成ボタンを表示する", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /新規作成/ })).toBeInTheDocument();
    });
  });

  it("デフォルトでdraftタブが選択されてdraftシリーズを表示する", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
      expect(screen.queryByText("テストテーマ2")).not.toBeInTheDocument();
    });
  });

  it("allタブでシリーズ全件を表示する", async () => {
    const user = userEvent.setup();
    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByRole("button", { name: "すべて" }));
    await user.click(screen.getByRole("button", { name: "すべて" }));
    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ2")).toBeInTheDocument();
    });
  });

  it("投稿テキストのプレビューを表示する", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByText("テスト投稿テキスト")).toBeInTheDocument();
    });
  });

  it("作成日 (created_at) を年月日で表示する", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByText("2024/01/01")).toBeInTheDocument();
    });
  });

  it("ステータスタブが表示される", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "下書き" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "予約中" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "投稿済み" })).toBeInTheDocument();
    });
  });

  it("ステータスタブでフィルタリングできる", async () => {
    const user = userEvent.setup();
    renderWithToast(<SnsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "予約中" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "予約中" }));

    await waitFor(() => {
      expect(screen.getByText("テストテーマ2")).toBeInTheDocument();
      expect(screen.queryByText("テストテーマ1")).not.toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SnsPage from "./page";

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
    render(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "SNS管理" })).toBeInTheDocument();
    });
  });

  it("新規作成ボタンを表示する", async () => {
    render(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /新規作成/ })).toBeInTheDocument();
    });
  });

  it("シリーズ一覧を表示する", async () => {
    render(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ2")).toBeInTheDocument();
    });
  });

  it("ステータスタブが表示される", async () => {
    render(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "all" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "draft" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "queued" })).toBeInTheDocument();
    });
  });

  it("ステータスタブでフィルタリングできる", async () => {
    const user = userEvent.setup();
    render(<SnsPage />);

    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "draft" }));

    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
      expect(screen.queryByText("テストテーマ2")).not.toBeInTheDocument();
    });
  });
});

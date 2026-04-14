import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import QueuePage from "./page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockQueueSeries = [
  {
    id: "1",
    theme: "キューテーマ1",
    pattern: "pattern-a",
    quality_score: 85,
    score_breakdown: null,
    status: "queued",
    queue_order: 1,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    posts: [{ id: "p1" }, { id: "p2" }],
  },
  {
    id: "2",
    theme: "キューテーマ2",
    pattern: "pattern-b",
    quality_score: 90,
    score_breakdown: null,
    status: "queued",
    queue_order: 2,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
    posts: [{ id: "p3" }],
  },
];

describe("QueuePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockQueueSeries }),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("ページタイトルを表示する", async () => {
    render(<QueuePage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "キュー管理" })).toBeInTheDocument();
    });
  });

  it("キュー内のシリーズを表示する", async () => {
    render(<QueuePage />);
    await waitFor(() => {
      expect(screen.getByText("キューテーマ1")).toBeInTheDocument();
      expect(screen.getByText("キューテーマ2")).toBeInTheDocument();
    });
  });

  it("各シリーズの投稿数を表示する", async () => {
    render(<QueuePage />);
    await waitFor(() => {
      expect(screen.getByText("2投稿")).toBeInTheDocument();
      expect(screen.getByText("1投稿")).toBeInTheDocument();
    });
  });

  it("次の投稿予定時刻の目安を表示する", async () => {
    render(<QueuePage />);
    await waitFor(() => {
      expect(screen.getAllByTestId("scheduled-time").length).toBeGreaterThan(0);
    });
  });
});

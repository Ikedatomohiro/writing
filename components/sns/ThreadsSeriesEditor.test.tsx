import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() })),
}));

import { ThreadsSeriesEditor } from "./ThreadsSeriesEditor";
import { ToastProvider } from "@/components/common/ToastProvider";
import { threadsPostUpdatedChannel } from "@/lib/events/seriesPostUpdated";

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSeriesWithPosts = {
  id: "s1",
  theme: "テストテーマ",
  pattern: "pattern-a",
  quality_score: 80,
  score_breakdown: null,
  status: "draft",
  queue_order: null,
  is_posted: false,
  posted_at: null,
  source: null,
  source_draft_id: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  posts: [
    {
      id: "p1",
      series_id: "s1",
      position: 0,
      text: "元の本文",
      type: "normal",
      threads_post_id: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  ],
};

describe("ThreadsSeriesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === "string" && url.startsWith("/api/threads/series/s1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("投稿保存に成功したら threadsPostUpdatedChannel に通知する", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/threads/series/s1/posts/p1") && init?.method === "PATCH") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { ...mockSeriesWithPosts.posts[0], text: "更新後の本文" } }) });
      }
      if (typeof url === "string" && url.startsWith("/api/threads/series/s1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });

    const handler = vi.fn();
    const unsubscribe = threadsPostUpdatedChannel.subscribe(handler);

    renderWithToast(<ThreadsSeriesEditor seriesId="s1" />);

    await waitFor(() => screen.getByDisplayValue("元の本文"));
    const textarea = screen.getByDisplayValue("元の本文");
    await user.clear(textarea);
    await user.type(textarea, "更新後の本文");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ seriesId: "s1", postId: "p1", text: "更新後の本文" })
      );
    });

    unsubscribe();
  });

  it("投稿保存に失敗したら threadsPostUpdatedChannel に通知しない", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/threads/series/s1/posts/p1") && init?.method === "PATCH") {
        return Promise.resolve({ ok: false, json: async () => ({ error: "failed" }) });
      }
      if (typeof url === "string" && url.startsWith("/api/threads/series/s1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });

    const handler = vi.fn();
    const unsubscribe = threadsPostUpdatedChannel.subscribe(handler);

    renderWithToast(<ThreadsSeriesEditor seriesId="s1" />);

    await waitFor(() => screen.getByDisplayValue("元の本文"));
    const textarea = screen.getByDisplayValue("元の本文");
    await user.clear(textarea);
    await user.type(textarea, "失敗するはずの本文");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/threads/series/s1/posts/p1",
        expect.objectContaining({ method: "PATCH" })
      );
    });

    expect(handler).not.toHaveBeenCalled();
    unsubscribe();
  });
});

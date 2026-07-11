import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() })),
}));

import { XSeriesEditor } from "./XSeriesEditor";
import { xPostUpdatedChannel } from "@/lib/events/seriesPostUpdated";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSeriesWithPosts = {
  id: "x1",
  account: "pao-pao-cho",
  theme: "Xテストテーマ",
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
      text: "元のX本文",
      x_post_id: null,
      source_url: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  ],
};

describe("XSeriesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === "string" && url.startsWith("/api/x/series/x1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("投稿保存に成功したら xPostUpdatedChannel に通知する", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/x/series/x1/posts/xp1") && init?.method === "PATCH") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { ...mockSeriesWithPosts.posts[0], text: "更新後のX本文" } }) });
      }
      if (typeof url === "string" && url.startsWith("/api/x/series/x1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });

    const handler = vi.fn();
    const unsubscribe = xPostUpdatedChannel.subscribe(handler);

    render(<XSeriesEditor seriesId="x1" />);

    await waitFor(() => screen.getByDisplayValue("元のX本文"));
    const textarea = screen.getByDisplayValue("元のX本文");
    await user.clear(textarea);
    await user.type(textarea, "更新後のX本文");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ seriesId: "x1", postId: "xp1", text: "更新後のX本文" })
      );
    });

    unsubscribe();
  });

  it("投稿保存に失敗したら xPostUpdatedChannel に通知しない", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/x/series/x1/posts/xp1") && init?.method === "PATCH") {
        return Promise.resolve({ ok: false, json: async () => ({ error: "failed" }) });
      }
      if (typeof url === "string" && url.startsWith("/api/x/series/x1")) {
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeriesWithPosts }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: [mockSeriesWithPosts] }) });
    });

    const handler = vi.fn();
    const unsubscribe = xPostUpdatedChannel.subscribe(handler);

    render(<XSeriesEditor seriesId="x1" />);

    await waitFor(() => screen.getByDisplayValue("元のX本文"));
    const textarea = screen.getByDisplayValue("元のX本文");
    await user.clear(textarea);
    await user.type(textarea, "失敗するはずのX本文");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/x/series/x1/posts/xp1",
        expect.objectContaining({ method: "PATCH" })
      );
    });

    expect(handler).not.toHaveBeenCalled();
    unsubscribe();
  });
});

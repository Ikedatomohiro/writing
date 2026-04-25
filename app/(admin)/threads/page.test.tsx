import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: mockReplace, back: vi.fn(), refresh: vi.fn() })),
  useParams: () => ({}),
  usePathname: () => "/threads",
}));

import { useSearchParams } from "next/navigation";
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
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams());
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

  it("アカウント切替ドロップダウンが表示される", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("デフォルトアカウントはpao-pao-choでfetch URLにaccount=pao-pao-choが含まれる", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=pao-pao-cho"))).toBe(true);
    });
  });

  it("アカウント切替でfetch URLが変わる", async () => {
    const user = userEvent.setup();
    renderWithToast(<SnsPage />);

    await waitFor(() => screen.getByRole("combobox"));
    await user.selectOptions(screen.getByRole("combobox"), "matsumoto_sho");

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=matsumoto_sho"))).toBe(true);
    });
  });

  it("URLクエリ ?account=morita_rin のとき、初期fetchは morita_rin で呼ばれる", async () => {
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams("account=morita_rin"));

    renderWithToast(<SnsPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    const calls = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(calls.every((url) => !url.includes("account=pao-pao-cho"))).toBe(true);
    expect(calls.some((url) => url.includes("account=morita_rin"))).toBe(true);
  });

  it("アカウント切替時に URL (router.replace) にも反映される", async () => {
    const user = userEvent.setup();
    renderWithToast(<SnsPage />);

    await waitFor(() => screen.getByRole("combobox"));
    await user.selectOptions(screen.getByRole("combobox"), "matsumoto_sho");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("account=matsumoto_sho"),
        expect.anything()
      );
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

  it("draftシリーズのカードに『キューに追加』ボタンが表示される", async () => {
    renderWithToast(<SnsPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "キューに追加" })).toBeInTheDocument();
    });
  });

  it("『キューに追加』ボタンをクリックするとenqueue APIが呼ばれる", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/threads/queue/enqueue" && init?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { id: "1" } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByRole("button", { name: "キューに追加" }));
    await user.click(screen.getByRole("button", { name: "キューに追加" }));

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls).toContain("/api/threads/queue/enqueue");
    });
  });

  it("queuedシリーズのカードに『下書きに戻す』ボタンが表示される", async () => {
    const user = userEvent.setup();
    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByRole("button", { name: "予約中" }));
    await user.click(screen.getByRole("button", { name: "予約中" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "下書きに戻す" })).toBeInTheDocument();
    });
  });

  it("投稿済みタブでは posted_at の降順で並ぶ", async () => {
    const postedSeries = [
      {
        ...mockSeries[0],
        id: "tp-old",
        theme: "古い投稿",
        status: "posted",
        is_posted: true,
        posted_at: "2024-02-01T00:00:00.000Z",
      },
      {
        ...mockSeries[0],
        id: "tp-new",
        theme: "新しい投稿",
        status: "posted",
        is_posted: true,
        posted_at: "2024-04-01T00:00:00.000Z",
      },
      {
        ...mockSeries[0],
        id: "tp-mid",
        theme: "中間投稿",
        status: "posted",
        is_posted: true,
        posted_at: "2024-03-01T00:00:00.000Z",
      },
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: postedSeries }),
    });

    const user = userEvent.setup();
    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByRole("button", { name: "投稿済み" }));
    await user.click(screen.getByRole("button", { name: "投稿済み" }));

    await waitFor(() => {
      expect(screen.getByText("新しい投稿")).toBeInTheDocument();
    });

    const headings = screen.getAllByRole("heading", { level: 3 });
    const themes = headings.map((h) => h.textContent?.trim());
    expect(themes).toEqual(["新しい投稿", "中間投稿", "古い投稿"]);
  });

  it("『下書きに戻す』ボタンをクリックするとPATCH APIが呼ばれる", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/threads/series/") && init?.method === "PATCH") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { id: "2" } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByRole("button", { name: "予約中" }));
    await user.click(screen.getByRole("button", { name: "予約中" }));
    await waitFor(() => screen.getByRole("button", { name: "下書きに戻す" }));
    await user.click(screen.getByRole("button", { name: "下書きに戻す" }));

    await waitFor(() => {
      const patchCalls = mockFetch.mock.calls.filter(
        (c) => (c[1] as RequestInit | undefined)?.method === "PATCH"
      );
      expect(patchCalls.length).toBeGreaterThan(0);
      expect(patchCalls[0][0]).toMatch(/\/api\/threads\/series\/2/);
    });
  });

  it("キュー追加に成功したらdraftタブから消えて予約中タブに追加される（optimistic）", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/threads/queue/enqueue" && init?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { id: "1" } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByText("テストテーマ1"));
    await user.click(screen.getByRole("button", { name: "キューに追加" }));

    await waitFor(() => {
      expect(screen.queryByText("テストテーマ1")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "予約中" }));
    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ2")).toBeInTheDocument();
    });
  });

  it("キュー追加に失敗したらdraftタブにアイテムが戻る（ロールバック）", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/threads/queue/enqueue" && init?.method === "POST") {
        return Promise.resolve({ ok: false, json: async () => ({ error: "failed" }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    renderWithToast(<SnsPage />);
    await waitFor(() => screen.getByText("テストテーマ1"));
    await user.click(screen.getByRole("button", { name: "キューに追加" }));

    await waitFor(() => {
      expect(screen.getByText("テストテーマ1")).toBeInTheDocument();
    });
  });

  describe("タブ件数バッジ", () => {
    it("各タブボタンに件数バッジが表示される（mockSeries: all=2, draft=1, queued=1, posted=0）", async () => {
      const { within } = await import("@testing-library/react");
      renderWithToast(<SnsPage />);

      await waitFor(() => {
        const allTab = screen.getByRole("button", { name: "すべて" });
        const draftTab = screen.getByRole("button", { name: "下書き" });
        const queuedTab = screen.getByRole("button", { name: "予約中" });
        const postedTab = screen.getByRole("button", { name: "投稿済み" });

        expect(within(allTab).getByText("2")).toBeInTheDocument();
        expect(within(draftTab).getByText("1")).toBeInTheDocument();
        expect(within(queuedTab).getByText("1")).toBeInTheDocument();
        // 0件時もバッジを表示する
        expect(within(postedTab).getByText("0")).toBeInTheDocument();
      });
    });

    it("キュー追加後に件数バッジがリアルタイムに更新される（draft: 1→0, queued: 1→2）", async () => {
      const { within } = await import("@testing-library/react");
      const user = userEvent.setup();
      mockFetch.mockImplementation((url: string, init?: RequestInit) => {
        if (url === "/api/threads/queue/enqueue" && init?.method === "POST") {
          return Promise.resolve({ ok: true, json: async () => ({ data: { id: "1" } }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
      });

      renderWithToast(<SnsPage />);
      await waitFor(() => screen.getByText("テストテーマ1"));
      await user.click(screen.getByRole("button", { name: "キューに追加" }));

      await waitFor(() => {
        const draftTab = screen.getByRole("button", { name: "下書き" });
        const queuedTab = screen.getByRole("button", { name: "予約中" });
        expect(within(draftTab).getByText("0")).toBeInTheDocument();
        expect(within(queuedTab).getByText("2")).toBeInTheDocument();
      });
    });
  });
});

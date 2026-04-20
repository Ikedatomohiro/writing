import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: mockReplace, back: vi.fn(), refresh: vi.fn() })),
  useParams: () => ({}),
  usePathname: () => "/x",
}));

import { useSearchParams } from "next/navigation";
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
  {
    id: "x2",
    account: "pao-pao-cho",
    theme: "Xテストテーマ2(queued)",
    category: "note_article",
    quality_score: null,
    score_breakdown: null,
    status: "queued",
    queue_order: 1,
    is_posted: false,
    posted_at: null,
    source: null,
    source_draft_id: null,
    note_url: null,
    hashtags: null,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
    posts: [
      {
        id: "xp2",
        series_id: "x2",
        position: 0,
        text: "X投稿テキスト2",
        x_post_id: null,
        source_url: null,
        created_at: "2024-01-02T00:00:00.000Z",
        updated_at: "2024-01-02T00:00:00.000Z",
      },
    ],
  },
];

describe("XPage", () => {
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
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=pao-pao-cho"))).toBe(true);
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
      expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "下書き" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "予約中" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "投稿済み" })).toBeInTheDocument();
    });
  });

  it("シリーズ一覧が表示される", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByText("Xテストテーマ1")).toBeInTheDocument();
    });
  });

  it("draftシリーズのカードに『キューに追加』ボタンが表示される", async () => {
    render(<XPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "キューに追加" })).toBeInTheDocument();
    });
  });

  it("『キューに追加』ボタンをクリックするとenqueue APIが呼ばれる", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/x/queue/enqueue" && init?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { id: "x1" } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    render(<XPage />);
    await waitFor(() => screen.getByRole("button", { name: "キューに追加" }));
    await user.click(screen.getByRole("button", { name: "キューに追加" }));

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls).toContain("/api/x/queue/enqueue");
    });
  });

  it("queuedシリーズのカードに『下書きに戻す』ボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<XPage />);
    await waitFor(() => screen.getByRole("button", { name: "予約中" }));
    await user.click(screen.getByRole("button", { name: "予約中" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "下書きに戻す" })).toBeInTheDocument();
    });
  });

  it("『下書きに戻す』ボタンをクリックするとPATCH APIが呼ばれる", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === "string" && url.startsWith("/api/x/series/") && init?.method === "PATCH") {
        return Promise.resolve({ ok: true, json: async () => ({ data: { id: "x2" } }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    render(<XPage />);
    await waitFor(() => screen.getByRole("button", { name: "予約中" }));
    await user.click(screen.getByRole("button", { name: "予約中" }));
    await waitFor(() => screen.getByRole("button", { name: "下書きに戻す" }));
    await user.click(screen.getByRole("button", { name: "下書きに戻す" }));

    await waitFor(() => {
      const patchCalls = mockFetch.mock.calls.filter(
        (c) => (c[1] as RequestInit | undefined)?.method === "PATCH"
      );
      expect(patchCalls.length).toBeGreaterThan(0);
      expect(patchCalls[0][0]).toMatch(/\/api\/x\/series\/x2/);
    });
  });

  it("URLクエリ ?account=morita_rin のとき、初期fetchは morita_rin で呼ばれる（pao-pao-cho を先に呼ばない）", async () => {
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams("account=morita_rin"));

    render(<XPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    const calls = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(calls.every((url) => !url.includes("account=pao-pao-cho"))).toBe(true);
    expect(calls.some((url) => url.includes("account=morita_rin"))).toBe(true);
  });

  it("URL優先: sessionStorage に別アカウントが残っていても URL が優先される", async () => {
    sessionStorage.setItem("x_active_account", "pao-pao-cho");
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams("account=morita_rin"));

    render(<XPage />);

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=morita_rin"))).toBe(true);
    });
    const calls = mockFetch.mock.calls.map((c) => c[0] as string);
    expect(calls.every((url) => !url.includes("account=pao-pao-cho"))).toBe(true);
  });

  it("URLクエリが無く sessionStorage に値があるとき、その値で fetch + URL にも反映される", async () => {
    sessionStorage.setItem("x_active_account", "matsumoto_sho");
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams());

    render(<XPage />);

    await waitFor(() => {
      const calls = mockFetch.mock.calls.map((c) => c[0] as string);
      expect(calls.some((url) => url.includes("account=matsumoto_sho"))).toBe(true);
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("account=matsumoto_sho"),
        expect.anything()
      );
    });
  });

  it("アカウント切替時に URL (router.replace) にも反映される", async () => {
    const user = userEvent.setup();
    render(<XPage />);

    await waitFor(() => screen.getByRole("combobox"));
    await user.selectOptions(screen.getByRole("combobox"), "matsumoto_sho");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("account=matsumoto_sho"),
        expect.anything()
      );
    });
  });

  it("投稿済みタブでは posted_at の降順で並ぶ", async () => {
    const postedSeries = [
      {
        ...mockSeries[0],
        id: "xp-old",
        theme: "古い投稿",
        status: "posted",
        is_posted: true,
        posted_at: "2024-02-01T00:00:00.000Z",
      },
      {
        ...mockSeries[0],
        id: "xp-new",
        theme: "新しい投稿",
        status: "posted",
        is_posted: true,
        posted_at: "2024-04-01T00:00:00.000Z",
      },
      {
        ...mockSeries[0],
        id: "xp-mid",
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
    render(<XPage />);
    await waitFor(() => screen.getByRole("button", { name: "投稿済み" }));
    await user.click(screen.getByRole("button", { name: "投稿済み" }));

    await waitFor(() => {
      expect(screen.getByText("新しい投稿")).toBeInTheDocument();
    });

    const headings = screen.getAllByRole("heading", { level: 3 });
    const themes = headings.map((h) => h.textContent?.trim());
    expect(themes).toEqual(["新しい投稿", "中間投稿", "古い投稿"]);
  });

  it("キュー追加に失敗したらアイテムがdraftタブに戻る（ロールバック）", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/x/queue/enqueue" && init?.method === "POST") {
        return Promise.resolve({ ok: false, json: async () => ({ error: "failed" }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: mockSeries }) });
    });

    render(<XPage />);
    await waitFor(() => screen.getByText("Xテストテーマ1"));
    await user.click(screen.getByRole("button", { name: "キューに追加" }));

    await waitFor(() => {
      expect(screen.getByText("Xテストテーマ1")).toBeInTheDocument();
    });
  });
});

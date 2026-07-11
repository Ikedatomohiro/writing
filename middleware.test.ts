import { describe, it, expect, vi, beforeEach } from "vitest";

// auth((handler)) をアンラップし、ハンドラを直接呼べるようにする。
vi.mock("@/auth", () => ({
  auth: (handler: unknown) => handler,
}));

type FakeReq = { auth: unknown; nextUrl: URL };

function makeReq(path: string, loggedIn: boolean): FakeReq {
  return {
    auth: loggedIn ? { user: { email: "a@b.c" } } : null,
    nextUrl: new URL(`http://localhost${path}`),
  };
}

async function run(path: string, loggedIn: boolean) {
  const mod = await import("./middleware");
  const mw = mod.default as unknown as (req: FakeReq) => Response;
  return mw(makeReq(path, loggedIn));
}

function location(res: Response): string | null {
  return res.headers.get("location");
}

describe("middleware 認証一般化", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.E2E_BYPASS_AUTH;
  });

  it.each(["/insights", "/dashboard", "/threads", "/x", "/articles"])(
    "保護ルート %s は未認証でログインへリダイレクト",
    async (path) => {
      const res = await run(path, false);
      expect(location(res)).toContain("/login");
    },
  );

  it.each(["/insights", "/dashboard", "/x"])(
    "保護ルート %s は認証済みなら通過（リダイレクトなし）",
    async (path) => {
      const res = await run(path, true);
      expect(location(res)).toBeNull();
    },
  );

  it.each(["/asset/my-article", "/tech/foo", "/health/bar", "/about", "/tag/x"])(
    "公開ブログ経路 %s は未認証でもリダイレクトしない（R2: 誤保護しない）",
    async (path) => {
      const res = await run(path, false);
      expect(location(res)).toBeNull();
    },
  );

  it("境界: /xyz は /x 保護に巻き込まれない", async () => {
    const res = await run("/xyz", false);
    expect(location(res)).toBeNull();
  });

  it("/login は認証済みなら /articles へ", async () => {
    const res = await run("/login", true);
    expect(location(res)).toContain("/articles");
  });

  it("/login は未認証ならそのまま表示", async () => {
    const res = await run("/login", false);
    expect(location(res)).toBeNull();
  });

  it("/api/auth/* は認証状態に関係なく通過", async () => {
    const res = await run("/api/auth/session", false);
    expect(location(res)).toBeNull();
  });
});

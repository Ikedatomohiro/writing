import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("セッションがない場合は401を返す", async () => {
    mockAuth.mockResolvedValue(null);
    const { requireAuth } = await import("./api-auth");

    const result = await requireAuth();

    expect(result).not.toBeNull();
    const data = await result!.json();
    expect(result!.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("セッションにuserがない場合は401を返す", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const { requireAuth } = await import("./api-auth");

    const result = await requireAuth();

    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("セッションが有効な場合はnullを返す", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const { requireAuth } = await import("./api-auth");

    const result = await requireAuth();

    expect(result).toBeNull();
  });
});

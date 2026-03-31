import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// storage モック
const mockAddSubscriber = vi.fn();
vi.mock("@/lib/newsletter/storage", () => ({
  addSubscriber: (...args: unknown[]) => mockAddSubscriber(...args),
}));

// nodemailer モック
const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({ sendMail: mockSendMail }),
  },
}));

describe("POST /api/newsletter/subscribe", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = {
      ...originalEnv,
      GMAIL_USER: "sender@gmail.com",
      GMAIL_APP_PASSWORD: "test-password",
      NEWSLETTER_ADMIN_EMAIL: "admin@example.com",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  async function callPOST(body?: unknown): Promise<Response> {
    const { POST } = await import("./route");
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return POST(new Request("http://localhost/api/newsletter/subscribe", init));
  }

  it("正常系: 新規登録で200を返す", async () => {
    mockAddSubscriber.mockResolvedValue({
      success: true,
      subscriber: {
        id: "sub-001",
        email: "new@example.com",
        createdAt: "2026-04-01T00:00:00Z",
      },
    });
    mockSendMail.mockResolvedValue({ messageId: "msg-001" });

    const response = await callPOST({ email: "new@example.com" });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockAddSubscriber).toHaveBeenCalledWith("new@example.com");
    expect(mockSendMail).toHaveBeenCalledOnce();
  });

  it("重複登録で409を返す", async () => {
    mockAddSubscriber.mockResolvedValue({
      success: false,
      error: "duplicate",
    });

    const response = await callPOST({ email: "existing@example.com" });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("不正なメールアドレスで400を返す", async () => {
    const response = await callPOST({ email: "not-an-email" });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(mockAddSubscriber).not.toHaveBeenCalled();
  });

  it("空ボディで400を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/newsletter/subscribe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(mockAddSubscriber).not.toHaveBeenCalled();
  });

  it("環境変数未設定で500を返す", async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    const response = await callPOST({ email: "test@example.com" });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(mockAddSubscriber).not.toHaveBeenCalled();
  });

  it("メール送信失敗でも登録は成功する", async () => {
    mockAddSubscriber.mockResolvedValue({
      success: true,
      subscriber: {
        id: "sub-002",
        email: "user@example.com",
        createdAt: "2026-04-01T00:00:00Z",
      },
    });
    mockSendMail.mockRejectedValue(new Error("SMTP error"));

    const response = await callPOST({ email: "user@example.com" });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockAddSubscriber).toHaveBeenCalledWith("user@example.com");
  });

  it("ストレージエラーで500を返す", async () => {
    mockAddSubscriber.mockRejectedValue(new Error("Storage unavailable"));

    const response = await callPOST({ email: "test@example.com" });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});

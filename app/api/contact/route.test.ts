import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({ sendMail: mockSendMail }),
  },
}));

describe("POST /api/contact", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CONTACT_EMAIL_TO: "admin@example.com",
      GMAIL_USER: "sender@gmail.com",
      GMAIL_APP_PASSWORD: "test-password",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("正常にメールを送信する", async () => {
    mockSendMail.mockResolvedValue({ messageId: "123" });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "山田太郎",
        email: "taro@example.com",
        subject: "一般",
        message: "テストメッセージ",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledOnce();
  });

  it("必須フィールドが不足している場合は400を返す", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "山田太郎" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("メール送信に失敗した場合は500を返す", async () => {
    mockSendMail.mockRejectedValue(new Error("SMTP error"));

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "山田太郎",
        email: "taro@example.com",
        subject: "一般",
        message: "テストメッセージ",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("環境変数が未設定の場合は500を返す", async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "山田太郎",
        email: "taro@example.com",
        subject: "一般",
        message: "テストメッセージ",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

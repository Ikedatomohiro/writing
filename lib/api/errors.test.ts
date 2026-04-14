import { describe, it, expect } from "vitest";
import { formatApiError } from "./errors";

describe("formatApiError", () => {
  it("returns network error message when no response", () => {
    const result = formatApiError(null, new TypeError("Failed to fetch"));
    expect(result).toBe("ネットワーク接続を確認してください");
  });

  it("returns 4xx message for client errors", () => {
    const mockRes = { status: 400, ok: false } as Response;
    const result = formatApiError(mockRes, null);
    expect(result).toBe("入力内容を確認してください");
  });

  it("returns 4xx message for 404", () => {
    const mockRes = { status: 404, ok: false } as Response;
    const result = formatApiError(mockRes, null);
    expect(result).toBe("入力内容を確認してください");
  });

  it("returns 5xx message for server errors", () => {
    const mockRes = { status: 500, ok: false } as Response;
    const result = formatApiError(mockRes, null);
    expect(result).toBe("一時的な障害です。数秒後に再試行してください");
  });

  it("returns 5xx message for 503", () => {
    const mockRes = { status: 503, ok: false } as Response;
    const result = formatApiError(mockRes, null);
    expect(result).toBe("一時的な障害です。数秒後に再試行してください");
  });

  it("returns generic message for unknown error", () => {
    const result = formatApiError(null, new Error("unknown"));
    expect(result).toBe("ネットワーク接続を確認してください");
  });
});

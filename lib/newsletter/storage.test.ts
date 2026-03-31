import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SubscribersData } from "./types";
import { createEmptySubscribersData } from "./types";

const mockHead = vi.fn();
const mockPut = vi.fn();

vi.mock("@vercel/blob", () => ({
  head: (...args: unknown[]) => mockHead(...args),
  put: (...args: unknown[]) => mockPut(...args),
}));

// crypto.randomUUID のモック
const mockRandomUUID = vi.fn();
vi.stubGlobal("crypto", { randomUUID: mockRandomUUID });

import { loadSubscribers, saveSubscribers, addSubscriber } from "./storage";

const BLOB_PATH = "newsletter/subscribers.json";

describe("loadSubscribers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Blob が存在しない場合、空の SubscribersData を返すこと", async () => {
    mockHead.mockRejectedValue(new Error("Not found"));

    const result = await loadSubscribers();

    expect(mockHead).toHaveBeenCalledWith(BLOB_PATH);
    expect(result).toEqual(createEmptySubscribersData());
  });

  it("Blob に既存データがある場合、パースして返すこと", async () => {
    const existingData: SubscribersData = {
      subscribers: [
        {
          id: "sub-001",
          email: "test@example.com",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      totalCount: 1,
    };

    // head で Blob の URL を取得
    mockHead.mockResolvedValue({
      url: "https://blob.vercel-storage.com/newsletter/subscribers.json",
    });

    // fetch でデータを取得（グローバル fetch をモック）
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(existingData),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await loadSubscribers();

    expect(mockHead).toHaveBeenCalledWith(BLOB_PATH);
    expect(result).toEqual(existingData);
  });
});

describe("saveSubscribers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("SubscribersData を JSON として Blob に保存すること", async () => {
    const data: SubscribersData = {
      subscribers: [
        {
          id: "sub-001",
          email: "test@example.com",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      totalCount: 1,
    };

    mockPut.mockResolvedValue({
      url: "https://blob.vercel-storage.com/newsletter/subscribers.json",
    });

    await saveSubscribers(data);

    expect(mockPut).toHaveBeenCalledWith(
      BLOB_PATH,
      JSON.stringify(data, null, 2),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      }
    );
  });
});

describe("addSubscriber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新規メールアドレスを追加できること", async () => {
    // loadSubscribers が空データを返す
    mockHead.mockRejectedValue(new Error("Not found"));
    // saveSubscribers が成功
    mockPut.mockResolvedValue({ url: "https://example.com/blob" });
    // UUID を固定
    mockRandomUUID.mockReturnValue("generated-uuid-001");

    const result = await addSubscriber("new@example.com");

    expect(result.success).toBe(true);
    expect(result.subscriber).toBeDefined();
    expect(result.subscriber!.id).toBe("generated-uuid-001");
    expect(result.subscriber!.email).toBe("new@example.com");
    expect(result.subscriber!.createdAt).toBeDefined();
  });

  it("既に登録済みのメールアドレスの場合、重複エラーを返すこと", async () => {
    const existingData: SubscribersData = {
      subscribers: [
        {
          id: "sub-001",
          email: "existing@example.com",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      totalCount: 1,
    };

    mockHead.mockResolvedValue({
      url: "https://blob.vercel-storage.com/newsletter/subscribers.json",
    });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(existingData),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await addSubscriber("existing@example.com");

    expect(result.success).toBe(false);
    expect(result.error).toBe("duplicate");
    expect(result.subscriber).toBeUndefined();
  });

  it("UUID が自動生成されること", async () => {
    mockHead.mockRejectedValue(new Error("Not found"));
    mockPut.mockResolvedValue({ url: "https://example.com/blob" });
    mockRandomUUID.mockReturnValue("auto-generated-uuid");

    const result = await addSubscriber("uuid-test@example.com");

    expect(result.success).toBe(true);
    expect(result.subscriber!.id).toBe("auto-generated-uuid");
    expect(mockRandomUUID).toHaveBeenCalled();
  });

  it("保存時に totalCount が正しく更新されること", async () => {
    mockHead.mockRejectedValue(new Error("Not found"));
    mockPut.mockResolvedValue({ url: "https://example.com/blob" });
    mockRandomUUID.mockReturnValue("new-uuid");

    await addSubscriber("count-test@example.com");

    const savedData = JSON.parse(mockPut.mock.calls[0][1] as string);
    expect(savedData.totalCount).toBe(1);
    expect(savedData.subscribers).toHaveLength(1);
  });
});

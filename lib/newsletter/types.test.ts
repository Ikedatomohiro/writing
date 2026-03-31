import { describe, it, expect } from "vitest";
import { createEmptySubscribersData } from "./types";
import type { Subscriber, SubscribersData } from "./types";

describe("createEmptySubscribersData", () => {
  it("subscribers が空配列であること", () => {
    const data = createEmptySubscribersData();
    expect(data.subscribers).toEqual([]);
  });

  it("totalCount が 0 であること", () => {
    const data = createEmptySubscribersData();
    expect(data.totalCount).toBe(0);
  });

  it("SubscribersData 型に適合すること", () => {
    const data: SubscribersData = createEmptySubscribersData();
    expect(data).toHaveProperty("subscribers");
    expect(data).toHaveProperty("totalCount");
  });

  it("呼び出しごとに新しいオブジェクトを返すこと", () => {
    const data1 = createEmptySubscribersData();
    const data2 = createEmptySubscribersData();
    expect(data1).not.toBe(data2);
    expect(data1.subscribers).not.toBe(data2.subscribers);
  });
});

describe("Subscriber 型", () => {
  it("必須フィールドを持つオブジェクトが型に適合すること", () => {
    const subscriber: Subscriber = {
      id: "sub-001",
      email: "test@example.com",
      createdAt: "2026-01-01T00:00:00Z",
    };
    expect(subscriber.id).toBe("sub-001");
    expect(subscriber.email).toBe("test@example.com");
    expect(subscriber.createdAt).toBe("2026-01-01T00:00:00Z");
  });
});

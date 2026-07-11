import { describe, it, expect, vi } from "vitest";
import { fetchMetricRows } from "./query";

/** supabase-js のクエリビルダを模したチェーン可能モック。 */
function makeClient(data: unknown, error: unknown = null) {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {};
  const record = (name: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push([name, args]);
      return builder;
    });
  builder.select = record("select");
  builder.eq = record("eq");
  builder.in = record("in");
  builder.then = (resolve: (v: unknown) => unknown) => resolve({ data, error });
  const from = vi.fn((table: string) => {
    calls.push(["from", [table]]);
    return builder;
  });
  return { client: { from }, calls };
}

describe("fetchMetricRows", () => {
  it("sns_metrics から取得し、window を絞る（platform 未指定は 24h+latest）", async () => {
    const { client, calls } = makeClient([{ post_id: "P1" }]);
    const rows = await fetchMetricRows(client as never, {});
    expect(rows).toEqual([{ post_id: "P1" }]);
    expect(calls).toContainEqual(["from", ["sns_metrics"]]);
    expect(calls).toContainEqual(["in", ["metric_window", ["24h", "latest"]]]);
  });

  it("platform=threads は threads/24h で絞る", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { platform: "threads" });
    expect(calls).toContainEqual(["eq", ["platform", "threads"]]);
    expect(calls).toContainEqual(["eq", ["metric_window", "24h"]]);
  });

  it("platform=x は x/latest で絞る", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { platform: "x" });
    expect(calls).toContainEqual(["eq", ["platform", "x"]]);
    expect(calls).toContainEqual(["eq", ["metric_window", "latest"]]);
  });

  it("account 指定で account 絞りを追加する", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { account: "morita_rin" });
    expect(calls).toContainEqual(["eq", ["account", "morita_rin"]]);
  });

  it("data が null なら空配列", async () => {
    const { client } = makeClient(null);
    expect(await fetchMetricRows(client as never, {})).toEqual([]);
  });

  it("error があれば例外を投げる", async () => {
    const { client } = makeClient(null, { message: "boom" });
    await expect(fetchMetricRows(client as never, {})).rejects.toThrow("boom");
  });
});

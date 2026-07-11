import { describe, it, expect, vi } from "vitest";
import { fetchMetricRows } from "./query";

/**
 * supabase-js のクエリビルダを模したチェーン可能モック。
 * `.range(from,to)` を PostgREST と同様に解釈し、dataset の該当スライスを返す。
 * これにより「ページングで全件を引けているか（＝行数上限で切り捨てていないか）」を
 * 構造的に検証できる（ビルダ呼び出しの有無だけを見る tautological なテストにしない）。
 */
function makeClient(dataset: unknown[], error: unknown = null) {
  const calls: Array<[string, unknown[]]> = [];
  let rangeArgs: [number, number] | null = null;
  const builder: Record<string, unknown> = {};
  const record = (name: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push([name, args]);
      if (name === "range") rangeArgs = args as [number, number];
      return builder;
    });
  builder.select = record("select");
  builder.eq = record("eq");
  builder.in = record("in");
  builder.order = record("order");
  builder.range = record("range");
  builder.then = (resolve: (v: unknown) => unknown) => {
    if (error) return resolve({ data: null, error });
    const data = rangeArgs
      ? dataset.slice(rangeArgs[0], rangeArgs[1] + 1)
      : dataset;
    return resolve({ data, error: null });
  };
  const from = vi.fn((table: string) => {
    calls.push(["from", [table]]);
    return builder;
  });
  return { client: { from }, calls };
}

function rows(n: number): Array<{ id: string }> {
  return Array.from({ length: n }, (_, i) => ({ id: `id-${i}` }));
}

describe("fetchMetricRows", () => {
  it("1ページに収まる場合は全件返す（窓では絞らない・W-b）", async () => {
    const { client, calls } = makeClient(rows(3));
    const result = await fetchMetricRows(client as never, {}, 10);
    expect(result).toHaveLength(3);
    expect(calls).toContainEqual(["from", ["sns_metrics"]]);
    // 窓フィルタは掛けない（全窓取得して TS 側で代表窓へ畳む）
    expect(calls.some(([n]) => n === "in")).toBe(false);
    expect(calls.some(([n, a]) => n === "eq" && (a as string[])[0] === "metric_window")).toBe(false);
  });

  it("行数上限（pageSize）を超えても全件をページングで取得する（D1: 切り捨て検出）", async () => {
    // 5 行 / pageSize=2 → range(0,1),(2,3),(4,5) の3ページ。切り捨てなら 2 件しか返らない。
    const { client, calls } = makeClient(rows(5));
    const result = await fetchMetricRows(client as never, {}, 2);
    expect(result).toHaveLength(5);
    const rangeCalls = calls.filter(([n]) => n === "range").map(([, a]) => a);
    expect(rangeCalls).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });

  it("ちょうど pageSize の倍数なら空ページを1回引いて停止する", async () => {
    const { client, calls } = makeClient(rows(4));
    const result = await fetchMetricRows(client as never, {}, 2);
    expect(result).toHaveLength(4);
    // range(0,1),(2,3) は満杯 → もう1ページ range(4,5)=空 で停止
    expect(calls.filter(([n]) => n === "range")).toHaveLength(3);
  });

  it("安定ページングのため id 昇順で order する", async () => {
    const { client, calls } = makeClient(rows(1));
    await fetchMetricRows(client as never, {}, 10);
    expect(calls).toContainEqual(["order", ["id", { ascending: true }]]);
  });

  it("platform=threads は platform だけで絞る（窓フィルタ無し）", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { platform: "threads" });
    expect(calls).toContainEqual(["eq", ["platform", "threads"]]);
    expect(calls.some(([n, a]) => n === "eq" && (a as string[])[0] === "metric_window")).toBe(false);
  });

  it("platform=x は platform だけで絞る（窓フィルタ無し）", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { platform: "x" });
    expect(calls).toContainEqual(["eq", ["platform", "x"]]);
    expect(calls.some(([n, a]) => n === "eq" && (a as string[])[0] === "metric_window")).toBe(false);
  });

  it("account 指定で account 絞りを追加する", async () => {
    const { client, calls } = makeClient([]);
    await fetchMetricRows(client as never, { account: "morita_rin" });
    expect(calls).toContainEqual(["eq", ["account", "morita_rin"]]);
  });

  it("data が null なら空配列", async () => {
    const { client } = makeClient([]);
    expect(await fetchMetricRows(client as never, {})).toEqual([]);
  });

  it("error があれば例外を投げる", async () => {
    const { client } = makeClient([], { message: "boom" });
    await expect(fetchMetricRows(client as never, {})).rejects.toThrow("boom");
  });
});

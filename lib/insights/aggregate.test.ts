import { describe, it, expect } from "vitest";
import {
  MIN_SAMPLE_SIZE,
  engagementRate,
  isProvisional,
  groupAverageRate,
  hourlyAverageRate,
  dailySeries,
  totals,
  buildSummary,
} from "./aggregate";
import type { MetricRow } from "./types";

function row(over: Partial<MetricRow> = {}): MetricRow {
  return {
    platform: "threads",
    account: "pao-pao-cho",
    post_id: "P1",
    metric_window: "24h",
    posted_at: "2026-04-02T02:00:00+00:00",
    views: 100,
    likes: 5,
    replies: 2,
    reposts: 1,
    quotes: 1,
    saves: 1,
    fetched_at: "2026-04-03T00:00:00+00:00",
    pattern: "体験談型",
    theme: "AI活用術",
    ...over,
  };
}

describe("engagementRate", () => {
  it("エンゲージメント合計 / views を返す", () => {
    // (5+2+1+1+1)/100 = 0.1
    expect(engagementRate(row())).toBeCloseTo(0.1);
  });

  it("views=0 は null（ゼロ除算を避ける）", () => {
    expect(engagementRate(row({ views: 0 }))).toBeNull();
  });

  it("views=null は null", () => {
    expect(engagementRate(row({ views: null }))).toBeNull();
  });

  it("欠損メトリクスは 0 として扱う", () => {
    // likes のみ 3、他 null → 3/100
    const r = row({ likes: 3, replies: null, reposts: null, quotes: null, saves: null });
    expect(engagementRate(r)).toBeCloseTo(0.03);
  });
});

describe("isProvisional", () => {
  it("n < MIN_SAMPLE_SIZE は true", () => {
    expect(isProvisional(MIN_SAMPLE_SIZE - 1)).toBe(true);
  });
  it("n >= MIN_SAMPLE_SIZE は false", () => {
    expect(isProvisional(MIN_SAMPLE_SIZE)).toBe(false);
  });
});

describe("groupAverageRate", () => {
  it("キー別に平均率とサンプル数を返す（降順）", () => {
    const rows = [
      row({ pattern: "A", views: 100, likes: 10, replies: 0, reposts: 0, quotes: 0, saves: 0 }), // 0.1
      row({ pattern: "A", views: 100, likes: 20, replies: 0, reposts: 0, quotes: 0, saves: 0 }), // 0.2
      row({ pattern: "B", views: 100, likes: 5, replies: 0, reposts: 0, quotes: 0, saves: 0 }), // 0.05
    ];
    const stats = groupAverageRate(rows, (r) => r.pattern);
    expect(stats[0].key).toBe("A");
    expect(stats[0].avgRate).toBeCloseTo(0.15);
    expect(stats[0].n).toBe(2);
    expect(stats[1].key).toBe("B");
    expect(stats[1].avgRate).toBeCloseTo(0.05);
  });

  it("率が null の行は n から除外する", () => {
    const rows = [
      row({ pattern: "A", views: 100, likes: 10, replies: 0, reposts: 0, quotes: 0, saves: 0 }), // 0.1
      row({ pattern: "A", views: 0 }), // null → 除外
    ];
    const stats = groupAverageRate(rows, (r) => r.pattern);
    expect(stats[0].n).toBe(1);
    expect(stats[0].avgRate).toBeCloseTo(0.1);
  });

  it("キーが null/空 の行は無視する", () => {
    const rows = [row({ pattern: null }), row({ pattern: "" })];
    expect(groupAverageRate(rows, (r) => r.pattern)).toEqual([]);
  });

  it("有効サンプルが無いグループは avgRate=null", () => {
    const rows = [row({ pattern: "A", views: 0 })];
    const stats = groupAverageRate(rows, (r) => r.pattern);
    expect(stats[0].avgRate).toBeNull();
    expect(stats[0].n).toBe(0);
  });

  it("n が閾値未満なら provisional=true", () => {
    const rows = [row({ pattern: "A", views: 100, likes: 1, replies: 0, reposts: 0, quotes: 0, saves: 0 })];
    expect(groupAverageRate(rows, (r) => r.pattern)[0].provisional).toBe(true);
  });
});

describe("hourlyAverageRate", () => {
  it("posted_at を JST(+9h) 変換して時刻別に集計する", () => {
    // UTC 02:00 -> JST 11:00
    const rows = [
      row({ posted_at: "2026-04-02T02:00:00+00:00", views: 100, likes: 10, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
    ];
    const stats = hourlyAverageRate(rows);
    expect(stats.find((s) => s.key === "11")).toBeDefined();
    expect(stats.find((s) => s.key === "11")!.avgRate).toBeCloseTo(0.1);
  });

  it("日付跨ぎ: UTC 20:00 -> JST 05:00(翌日) の hour=5", () => {
    const rows = [row({ posted_at: "2026-04-02T20:00:00+00:00" })];
    const stats = hourlyAverageRate(rows);
    expect(stats.find((s) => s.key === "5")).toBeDefined();
  });

  it("posted_at が null の行は無視する", () => {
    expect(hourlyAverageRate([row({ posted_at: null })])).toEqual([]);
  });
});

describe("dailySeries", () => {
  it("posted_at(JST) の日付別に views/likes を合計する", () => {
    const rows = [
      row({ post_id: "A", posted_at: "2026-04-02T02:00:00+00:00", views: 100, likes: 5 }),
      row({ post_id: "B", posted_at: "2026-04-02T06:00:00+00:00", views: 30, likes: 2 }),
    ];
    const series = dailySeries(rows);
    expect(series).toEqual([{ date: "2026-04-02", views: 130, likes: 7 }]);
  });

  it("複数日は日付昇順で返す", () => {
    const rows = [
      row({ post_id: "B", posted_at: "2026-04-03T02:00:00+00:00", views: 10, likes: 1 }),
      row({ post_id: "A", posted_at: "2026-04-01T02:00:00+00:00", views: 20, likes: 2 }),
    ];
    expect(dailySeries(rows).map((d) => d.date)).toEqual(["2026-04-01", "2026-04-03"]);
  });

  it("日付跨ぎ: UTC 15:30 は JST 翌日 00:30 として翌日に集計する", () => {
    // UTC 2026-04-01T15:30 -> JST 2026-04-02T00:30
    const rows = [row({ posted_at: "2026-04-01T15:30:00+00:00", views: 40, likes: 3 })];
    expect(dailySeries(rows)[0].date).toBe("2026-04-02");
  });

  it("posted_at が null / 不正な行は無視する", () => {
    expect(dailySeries([row({ posted_at: null })])).toEqual([]);
    expect(dailySeries([row({ posted_at: "not-a-date" })])).toEqual([]);
  });

  it("null 値は 0 扱いで合計する", () => {
    const rows = [row({ posted_at: "2026-04-02T02:00:00+00:00", views: null, likes: null })];
    expect(dailySeries(rows)).toEqual([{ date: "2026-04-02", views: 0, likes: 0 }]);
  });
});

describe("totals", () => {
  it("views/likes 累計と投稿数(distinct post_id)を返す", () => {
    const rows = [
      row({ post_id: "P1", views: 100, likes: 5 }),
      row({ post_id: "P1", metric_window: "1h", views: 50, likes: 2 }), // 同一投稿の別窓
      row({ post_id: "P2", views: 30, likes: 1 }),
    ];
    const t = totals(rows);
    expect(t.totalViews).toBe(180);
    expect(t.totalLikes).toBe(8);
    expect(t.postCount).toBe(2);
  });

  it("null 値は 0 扱い", () => {
    const t = totals([row({ views: null, likes: null })]);
    expect(t.totalViews).toBe(0);
    expect(t.totalLikes).toBe(0);
  });
});

describe("buildSummary", () => {
  it("pattern/theme は Threads 行のみ、hourly と totals は全行から集計する", () => {
    const rows = [
      row({ platform: "threads", post_id: "T1", pattern: "A", theme: "AI", views: 100, likes: 10, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
      row({ platform: "x", post_id: "X1", pattern: null, theme: null, views: 100, likes: 20, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
    ];
    const s = buildSummary(rows, "pao-pao-cho", null);
    expect(s.account).toBe("pao-pao-cho");
    expect(s.patternStats.map((g) => g.key)).toEqual(["A"]); // X は pattern を持たない
    expect(s.themeStats.map((g) => g.key)).toEqual(["AI"]);
    expect(s.hourlyStats.length).toBeGreaterThan(0); // 両プラットフォーム
    expect(s.totals.postCount).toBe(2);
    expect(s.rowCount).toBe(2);
  });
});

// --- C: views(リーチ) 集計 + 低リーチフラグ + 反転回帰テスト -------------------

import { MIN_VIEWS_FOR_RATE, groupSumViews } from "./aggregate";
import type { ViewStat } from "./types";

describe("groupAverageRate: avgViews と lowReach", () => {
  it("グループの平均 views を返す", () => {
    const rows = [
      row({ pattern: "A", views: 100, likes: 1, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
      row({ pattern: "A", views: 300, likes: 1, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
    ];
    const s = groupAverageRate(rows, (r) => r.pattern)[0];
    expect(s.avgViews).toBe(200);
  });

  it("平均 views が閾値未満なら lowReach=true（除外はしない）", () => {
    const rows = [row({ pattern: "A", views: 40, likes: 50, replies: 0, reposts: 0, quotes: 0, saves: 0 })];
    const s = groupAverageRate(rows, (r) => r.pattern)[0];
    expect(s.lowReach).toBe(true);
    expect(s.avgRate).toBeGreaterThan(1); // 低リーチで率が100%超になりうる（除外せず残す）
  });

  it("平均 views が閾値以上なら lowReach=false", () => {
    const rows = [row({ pattern: "A", views: 5000, likes: 50, replies: 0, reposts: 0, quotes: 0, saves: 0 })];
    expect(groupAverageRate(rows, (r) => r.pattern)[0].lowReach).toBe(false);
  });
});

describe("groupSumViews", () => {
  it("キー別の views 合計と n を降順で返す", () => {
    const rows = [
      row({ theme: "金融", views: 10000 }),
      row({ theme: "金融", views: 5000 }),
      row({ theme: "HSP", views: 40 }),
    ];
    const stats = groupSumViews(rows, (r) => r.theme);
    expect(stats[0]).toMatchObject({ key: "金融", totalViews: 15000, n: 2 });
    expect(stats[1]).toMatchObject({ key: "HSP", totalViews: 40, n: 1 });
  });

  it("キーが null/空 の行は無視、views 欠損は 0 扱い", () => {
    const rows = [row({ theme: null, views: 999 }), row({ theme: "X", views: null })];
    const stats = groupSumViews(rows, (r) => r.theme);
    expect(stats).toEqual<ViewStat[]>([{ key: "X", totalViews: 0, n: 1 }]);
  });
});

describe("反転回帰: リーチ(views) と 刺さり度(率) は逆順になりうる（C の核心）", () => {
  // 金融 = 高リーチ低率、HSP = 低リーチ高率。views と率で順位が逆転することを固定する。
  const finance = Array.from({ length: 6 }, () =>
    row({ theme: "金融", views: 10000, likes: 100, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
  ); // rate 1%, views 10000
  const hsp = Array.from({ length: 6 }, () =>
    row({ theme: "HSP", views: 40, likes: 50, replies: 0, reposts: 0, quotes: 0, saves: 0 }),
  ); // rate 125%, views 40
  const rows = [...finance, ...hsp];

  it("率チャートは HSP が上位（低リーチが率を過大化）", () => {
    const rate = groupAverageRate(rows, (r) => r.theme);
    expect(rate[0].key).toBe("HSP");
    expect(rate[1].key).toBe("金融");
    expect(rate.find((s) => s.key === "HSP")!.lowReach).toBe(true);
    expect(rate.find((s) => s.key === "金融")!.lowReach).toBe(false);
  });

  it("views チャートは金融が上位（実リーチ順）＝率と逆", () => {
    const views = groupSumViews(rows, (r) => r.theme);
    expect(views[0].key).toBe("金融");
    expect(views[1].key).toBe("HSP");
  });
});

describe("buildSummary: themeViews / accountViews", () => {
  it("themeViews(Threads) と accountViews(全体) を含む", () => {
    const rows = [
      row({ platform: "threads", account: "pao-pao-cho", theme: "金融", views: 10000 }),
      row({ platform: "x", account: "tomohiro", theme: null, views: 200 }),
    ];
    const s = buildSummary(rows, null, null);
    expect(s.themeViews[0]).toMatchObject({ key: "金融", totalViews: 10000 });
    const accts = Object.fromEntries(s.accountViews.map((v) => [v.key, v.totalViews]));
    expect(accts["pao-pao-cho"]).toBe(10000);
    expect(accts["tomohiro"]).toBe(200);
  });
});

describe("MIN_VIEWS_FOR_RATE", () => {
  it("定数として公開されている", () => {
    expect(typeof MIN_VIEWS_FOR_RATE).toBe("number");
    expect(MIN_VIEWS_FOR_RATE).toBeGreaterThan(0);
  });
});

// --- F-1 / W-b: 代表窓への dedup（post_id 重複ガード + 窓欠損投稿の保持） -------

import { dedupeToRepresentative } from "./aggregate";

describe("dedupeToRepresentative", () => {
  it("同一投稿の複数窓は代表窓（24h > 6h > 1h）1行に畳む（F-1: 二重加算防止）", () => {
    const rows = [
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", metric_window: "1h", views: 10 }),
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", metric_window: "24h", views: 100 }),
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", metric_window: "6h", views: 50 }),
    ];
    const out = dedupeToRepresentative(rows);
    expect(out).toHaveLength(1);
    expect(out[0].metric_window).toBe("24h");
    expect(out[0].views).toBe(100);
  });

  it("24h が無ければ 6h > 1h の順で最良窓を残す（W-b: 窓欠損投稿を落とさない）", () => {
    const rows = [
      row({ platform: "threads", post_id: "T2", metric_window: "1h", views: 10 }),
      row({ platform: "threads", post_id: "T2", metric_window: "6h", views: 50 }),
    ];
    const out = dedupeToRepresentative(rows);
    expect(out).toHaveLength(1);
    expect(out[0].metric_window).toBe("6h");
  });

  it("別アカウントの同一 post_id は畳まない（platform+account+post_id キー）", () => {
    const rows = [
      row({ platform: "x", account: "pao-pao-cho", post_id: "X1", metric_window: "latest" }),
      row({ platform: "x", account: "matsumoto_sho", post_id: "X1", metric_window: "latest" }),
    ];
    expect(dedupeToRepresentative(rows)).toHaveLength(2);
  });

  it("回帰ガード: 24h のみの現行データは行数も内容も不変", () => {
    const rows = [
      row({ platform: "threads", account: "pao-pao-cho", post_id: "A", metric_window: "24h", views: 100 }),
      row({ platform: "threads", account: "morita_rin", post_id: "B", metric_window: "24h", views: 50 }),
      row({ platform: "x", account: "tomohiro", post_id: "C", metric_window: "latest", views: 30 }),
    ];
    const out = dedupeToRepresentative(rows);
    expect(out).toHaveLength(3);
    expect(out.map((r) => r.post_id).sort()).toEqual(["A", "B", "C"]);
  });
});

describe("buildSummary は dedup 済みで集計する（F-1）", () => {
  it("複数窓があっても views を二重加算しない", () => {
    const rows = [
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", theme: "金融", metric_window: "1h", views: 10 }),
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", theme: "金融", metric_window: "24h", views: 100 }),
    ];
    const s = buildSummary(rows, null, null);
    // 代表窓 24h の 100 のみ（10+100=110 にならない）
    expect(s.totals.totalViews).toBe(100);
    expect(s.themeViews.find((v) => v.key === "金融")!.totalViews).toBe(100);
    expect(s.totals.postCount).toBe(1);
  });

  it("日次推移も代表窓 1 行のみを数える（複数窓を二重加算しない）", () => {
    const rows = [
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", posted_at: "2026-04-02T02:00:00+00:00", metric_window: "1h", views: 10, likes: 1 }),
      row({ platform: "threads", account: "pao-pao-cho", post_id: "T1", posted_at: "2026-04-02T02:00:00+00:00", metric_window: "24h", views: 100, likes: 8 }),
    ];
    const s = buildSummary(rows, null, null);
    expect(s.dailySeries).toEqual([{ date: "2026-04-02", views: 100, likes: 8 }]);
  });
});

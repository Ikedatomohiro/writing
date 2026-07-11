# insights — task

- [ ] T1 `lib/insights/types.ts` — 型定義
- [ ] T2 `lib/insights/aggregate.test.ts` → `aggregate.ts`（TDD・純関数）
  - engagementRate / groupAverageRate / withSampleFlag / hourlyAverageRate / totals / MIN_SAMPLE_SIZE
- [ ] T3 `lib/insights/query.test.ts` → `query.ts`（Supabase 取得・フィルタ）
- [ ] T4 `app/api/insights/summary/route.test.ts` → `route.ts`（requireAuth）
- [ ] T5 `app/(admin)/insights/InsightsCharts.test.tsx` → `InsightsCharts.tsx`（SVG 横棒・n併記・淡色）
- [ ] T6 `app/(admin)/insights/MetricsTable.test.tsx` → `MetricsTable.tsx`
- [ ] T7 `app/(admin)/insights/page.tsx`（サーバー取得・組み立て）＋ test
- [ ] T8 `middleware.test.ts` → `middleware.ts` 一般化（保護/公開 双方）
- [ ] T9 `app/(admin)/dashboard/page.tsx` に導線カード追加
- [ ] T10 `app/(admin)/insights/README.md`
- [ ] T11 全テスト + カバレッジ確認（80%以上）

## spec 照合

- [x] 主指標 ER・n併記・閾値抑制 → T2
- [x] パターン/テーマ/時間帯 横棒 → T5
- [x] KPI カード・テーブル → T5/T6/T7
- [x] API requireAuth → T4
- [x] middleware 一般化＋公開経路保護しない → T8
- [x] 導線カード → T9

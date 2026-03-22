# アクセスランキング機能 タスクリスト

## タスク一覧

### 1. GA4 トラッキング埋め込み
- [ ] 1.1 `@next/third-parties` パッケージインストール
- [ ] 1.2 `app/layout.tsx` に `GoogleAnalytics` コンポーネント追加
- [ ] 1.3 `.env.example` に `NEXT_PUBLIC_GA_MEASUREMENT_ID` 追加

### 2. GA4 Data API クライアント
- [ ] 2.1 `@google-analytics/data` パッケージインストール
- [ ] 2.2 `lib/analytics/types.ts` 型定義作成
- [ ] 2.3 `lib/analytics/client.ts` テスト作成（Red）
- [ ] 2.4 `lib/analytics/client.ts` 実装（Green）

### 3. API エンドポイント
- [ ] 3.1 `app/api/analytics/ranking/route.test.ts` テスト作成（Red）
- [ ] 3.2 `app/api/analytics/ranking/route.ts` 実装（Green）

### 4. ダッシュボード UI
- [ ] 4.1 `app/(admin)/articles/AccessRanking.test.tsx` テスト作成（Red）
- [ ] 4.2 `app/(admin)/articles/AccessRanking.tsx` 実装（Green）
- [ ] 4.3 ダッシュボードページへの組み込み

### 5. ドキュメント・設定
- [ ] 5.1 `.env.example` に GA4 関連の環境変数を追加

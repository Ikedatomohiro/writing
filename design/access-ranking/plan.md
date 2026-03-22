# アクセスランキング機能 実装計画

## 実装ステップ

### Step 1: GA4 トラッキング埋め込み

- `@next/third-parties` パッケージインストール
- ルートレイアウト (`app/layout.tsx`) に `GoogleAnalytics` コンポーネント追加
- 本番環境のみで有効化

**影響ファイル:**
- `package.json`
- `app/layout.tsx`

### Step 2: GA4 Data API クライアント実装

- `@google-analytics/data` パッケージインストール
- `lib/analytics/client.ts` - GA4 Data API クライアント
- `lib/analytics/types.ts` - 型定義
- サービスアカウント認証（環境変数ベース）
- GA4 未設定時のグレースフルデグラデーション

**影響ファイル:**
- `package.json`
- `lib/analytics/client.ts`（新規）
- `lib/analytics/types.ts`（新規）

### Step 3: API エンドポイント実装

- `GET /api/analytics/ranking` エンドポイント作成
- 認証チェック（既存の認証基盤を利用）
- 記事ページのみフィルタリング

**影響ファイル:**
- `app/api/analytics/ranking/route.ts`（新規）

### Step 4: ダッシュボード UI 実装

- `AccessRanking` コンポーネント作成
- ダッシュボードページに配置
- ローディング・エラー・空状態のハンドリング

**影響ファイル:**
- `app/(admin)/articles/AccessRanking.tsx`（新規）
- `app/(admin)/articles/page.tsx`（修正）

## 依存関係

```
Step 1 (トラッキング) → 独立
Step 2 (API クライアント) → 独立
Step 3 (API エンドポイント) → Step 2 に依存
Step 4 (UI) → Step 3 に依存
```

## テスト計画

- GA4 クライアント: モックを使ったユニットテスト
- API エンドポイント: 認証チェック、レスポンス形式のテスト
- UI コンポーネント: ランキング表示、ローディング、エラー状態のテスト

# アクセスランキング機能 仕様書

## 目的・背景

管理画面のダッシュボードにブログ記事のアクセスランキングを表示する。
現在のダッシュボードはハードコードされた仮データのみで、実際のアクセス状況が把握できない。
Google Analytics 4 を導入し、Data API でアクセスデータを取得してランキングを表示する。

## 機能要件

### 1. GA4 トラッキング埋め込み

- 公開ページ（`app/(public)/`）に GA4 トラッキングコードを埋め込む
- `@next/third-parties/google` の `GoogleAnalytics` コンポーネントを使用
- 本番環境（`NODE_ENV === "production"`）のみで有効
- Measurement ID は環境変数 `NEXT_PUBLIC_GA_MEASUREMENT_ID` から取得

### 2. GA4 Data API 連携

- サーバーサイドで Google Analytics Data API を呼び出す
- サービスアカウント認証（環境変数: `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY`）
- Vercel デプロイに対応（ファイルパスではなく環境変数で認証情報を渡す）

### 3. アクセスランキング表示

- 管理画面ダッシュボードにランキングセクションを追加
- 表示項目:
  - 順位
  - 記事タイトル（ページタイトル）
  - PV数
  - ページパス（リンク）
- 期間: 直近30日間
- 表示件数: 上位10件
- 記事ページ（`/asset/`, `/tech/`, `/health/`）のみフィルタリング

### 4. API エンドポイント

- `GET /api/analytics/ranking` - アクセスランキング取得
- 認証必須（管理者のみ）
- レスポンス形式:
  ```json
  {
    "ranking": [
      {
        "path": "/asset/investment-basics",
        "title": "投資の基礎知識",
        "pageViews": 1234
      }
    ],
    "period": {
      "startDate": "2026-02-20",
      "endDate": "2026-03-22"
    }
  }
  ```

## 非機能要件

- GA4 未設定時（環境変数なし）はエラーにせず、空のランキングを返す
- API レスポンスは ISR またはサーバーサイドキャッシュで負荷軽減（初期は不要）
- サービスアカウントの秘密鍵はコードにハードコードしない

## 環境変数

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 計測タグ ID | Yes（本番） |
| `GA4_PROPERTY_ID` | Data API 用プロパティ ID | Yes |
| `GA_CLIENT_EMAIL` | サービスアカウントメール | Yes |
| `GA_PRIVATE_KEY` | サービスアカウント秘密鍵 | Yes |

## 成功基準

- 管理画面ダッシュボードでアクセスランキングが表示される
- GA4 未設定時にエラーが発生しない
- 認証なしでランキング API にアクセスできない

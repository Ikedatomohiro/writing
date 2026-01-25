# テーマシステム仕様書

## 背景

3カテゴリ（資産形成・プログラミング・健康）でテーマカラーを切り替える仕組みが必要。
デザインシステム（`design/design-system.md`）で定義されたカラートークンを実装に反映する。

## 目的

- カテゴリに応じてテーマカラーが切り替わる仕組みを実装する
- CSS変数でカラートークンを定義し、一元管理する
- Tailwind CSSを導入し、カスタムカラーとして設定する

## 機能要件

### 1. カラートークン定義

CSS変数として以下を定義:

**ベースカラー**:
- `--bg-primary`: #FAFAF9（ページ背景）
- `--bg-surface`: #F5F5F4（サーフェス背景）
- `--bg-card`: #FFFFFF（カード背景）
- `--text-primary`: #1C1917（主要テキスト）
- `--text-secondary`: #57534E（二次テキスト）
- `--text-muted`: #A8A29E（控えめなテキスト）
- `--border`: #E7E5E4（ボーダー）
- `--border-strong`: #D6D3D1（強調ボーダー）

**カテゴリ別テーマカラー**:
- Investment: accent=#0891B2, bg=#ECFEFF
- Programming: accent=#7C3AED, bg=#F5F3FF
- Health: accent=#16A34A, bg=#F0FDF4

### 2. テーマ切り替えロジック

- URLパス（`/asset/*`, `/tech/*`, `/health/*`）でカテゴリを判定
- カテゴリに応じて `data-theme` 属性をbodyに付与
- CSS変数がテーマに応じて切り替わる

### 3. Tailwind CSS設定

- `tailwind.config.ts` でカスタムカラーを定義
- CSS変数を参照する形式（`var(--color-name)`）

## 非機能要件

- SSR対応（Server Componentsで動作）
- パフォーマンス：追加のJSバンドルサイズを最小限に

## 制約事項

- Next.js 15 (App Router)
- Tailwind CSS v4（最新版）
- 既存のChakra UIとの共存を考慮

## 成功基準

- [ ] CSS変数でカラートークンが定義されている
- [ ] Tailwindでカスタムカラーが使用できる
- [ ] URLパスに応じてテーマカラーが切り替わる
- [ ] ビルドが成功する
- [ ] テストが通る

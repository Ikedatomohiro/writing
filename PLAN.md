# ブログサイト実装計画

Vercelでブログ記事管理サイトを公開するための実装計画。

## 現状

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: Chakra UI v3 + React 19
- **テスト**: Vitest
- **デプロイ先**: Vercel

## ゴール

記事の作成・編集・公開管理ができる管理画面をVercelで公開する。

---

## Phase 0: 認証基盤

Google認証 + ホワイトリスト方式でアクセス制御を実装。

### タスク

- [ ] NextAuth.js (Auth.js v5) のインストール・設定
- [ ] Google Cloud Console で OAuth 2.0 クライアント作成
- [ ] ログイン画面 (`/login`) の実装
- [ ] ホワイトリスト検証ロジックの実装
- [ ] ミドルウェアによるルート保護
- [ ] 環境変数の設定（ローカル・Vercel）

### 環境変数

```bash
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=xxx
ALLOWED_EMAILS=user@gmail.com
```

### 成果物

```
app/
├── login/page.tsx
├── api/auth/[...nextauth]/route.ts
lib/
├── auth/
│   ├── config.ts
│   └── whitelist.ts
middleware.ts
```

---

## Phase 1: 記事管理MVP

ローカルストレージを使用した最小限の記事管理機能。

### タスク

- [ ] データモデル・型定義 (`lib/articles/types.ts`)
- [ ] ローカルストレージ操作 (`lib/articles/storage.ts`)
- [ ] 記事一覧ページ (`/articles`)
- [ ] 記事作成ページ (`/articles/new`)
- [ ] 記事編集ページ (`/articles/[id]/edit`)
- [ ] 記事詳細/プレビューページ (`/articles/[id]`)
- [ ] 記事削除機能
 
### データモデル

```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
```

### 成果物

```
app/
├── articles/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── edit/page.tsx
components/
├── articles/
│   ├── ArticleList.tsx
│   ├── ArticleCard.tsx
│   └── ArticleForm.tsx
lib/
├── articles/
│   ├── types.ts
│   ├── storage.ts
│   └── validation.ts
```

---

## Phase 2: UX改善

### タスク

- [ ] Markdownエディタ導入 (`@uiw/react-md-editor`)
- [ ] リアルタイムプレビュー機能
- [ ] 自動保存機能
- [ ] 検索・フィルタリング機能
- [ ] ソート機能

---

## Phase 3: データ永続化

ローカルストレージからサーバーサイドストレージへ移行。

### 選択肢

| 方式 | メリット | デメリット |
|------|----------|------------|
| Vercel Blob | Vercel統合、シンプル | Vercel依存 |
| AWS S3 | スケーラブル、低コスト | 設定が複雑 |
| Vercel Postgres | RDB、クエリ柔軟 | コスト高め |

### 推奨: Vercel Blob → 将来的にS3

Phase 1はVercel Blobで開始し、要件に応じてS3へ移行。

### タスク

- [ ] Vercel Blob のセットアップ
- [ ] API Routes の実装
- [ ] ストレージ層の抽象化（S3移行を見据えて）

---

## Phase 4: 公開ブログ機能

管理画面とは別に、公開用のブログページを実装。

### タスク

- [ ] 公開記事一覧ページ (`/blog`)
- [ ] 記事詳細ページ (`/blog/[slug]`)
- [ ] OGP/メタタグ設定
- [ ] RSS フィード生成
- [ ] サイトマップ生成

---

## Vercelデプロイ手順

### 1. Vercelプロジェクト作成

```bash
# Vercel CLI インストール（未インストールの場合）
npm i -g vercel

# プロジェクトリンク
vercel link
```

### 2. 環境変数設定

Vercel Dashboard > Settings > Environment Variables で以下を設定:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ALLOWED_EMAILS`

### 3. デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 4. Google OAuth コールバックURL設定

Google Cloud Console で認証済みリダイレクト URI を追加:

```
https://your-app.vercel.app/api/auth/callback/google
```

---

## 技術選定サマリー

| カテゴリ | 選定 | 理由 |
|----------|------|------|
| 認証 | NextAuth.js v5 | App Router対応、Google OAuth簡単 |
| UIコンポーネント | Chakra UI v3 | 既存導入済み |
| Markdownエディタ | @uiw/react-md-editor | 軽量、機能十分 |
| ストレージ (Phase 1) | localStorage | 開発速度優先 |
| ストレージ (Phase 3) | Vercel Blob → S3 | 段階的移行 |

---

## スケジュール目安

| Phase | 内容 | 優先度 |
|-------|------|--------|
| Phase 0 | 認証基盤 | 高 |
| Phase 1 | 記事管理MVP | 高 |
| Phase 2 | UX改善 | 中 |
| Phase 3 | データ永続化 | 中 |
| Phase 4 | 公開ブログ | 低 |

---

## 注意事項

- Phase 1のlocalStorageはブラウザ間でデータ共有不可
- 本番運用前にPhase 3のストレージ移行が必要
- Markdownのサニタイズ必須（XSS対策）
- 環境変数にシークレットをハードコードしない

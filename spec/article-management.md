# 記事管理画面 スペック

## 概要

記事の作成・編集・削除・公開管理を行う管理画面。

## 目的

- 記事の一元管理
- 下書きから公開までのワークフロー管理
- キーワードエージェントとの連携

---

## 認証・認可

### 認証方式

- **Googleログイン** (OAuth 2.0)
- NextAuth.js (Auth.js) を使用

### アクセス制御

- **ホワイトリスト方式**: 許可されたメールアドレスのみアクセス可能
- ホワイトリストは環境変数で管理

### 認証フロー

```
[未認証ユーザー]
       ↓
  /login にリダイレクト
       ↓
  [Googleでログイン]
       ↓
  メールアドレスをホワイトリストと照合
       ↓
  ┌─────────────────┬─────────────────┐
  │ 許可されている   │ 許可されていない │
  │       ↓         │        ↓        │
  │ /articles へ    │ エラー表示      │
  │ リダイレクト    │ ログアウト      │
  └─────────────────┴─────────────────┘
```

### 画面構成（認証関連）

```
/login              # ログイン画面
/api/auth/[...nextauth]  # NextAuth.js エンドポイント
```

### ログイン画面 (`/login`)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   記事管理システム                   │
│                                                     │
│            ┌─────────────────────────┐             │
│            │  🔐 Googleでログイン    │             │
│            └─────────────────────────┘             │
│                                                     │
│         許可されたユーザーのみアクセス可能           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 環境変数

```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# NextAuth.js
NEXTAUTH_URL=https://writing-taupe.vercel.app
NEXTAUTH_SECRET=xxx  # openssl rand -base64 32 で生成

# ホワイトリスト（カンマ区切り）
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com
```

### 技術選定

- **NextAuth.js v5 (Auth.js)**: Next.js App Router対応
- **Google Provider**: OAuth 2.0認証

### コンポーネント構成（認証関連）

```
app/
├── login/
│   └── page.tsx          # ログイン画面
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts  # NextAuth.js API
│
lib/
├── auth/
│   ├── config.ts         # NextAuth.js設定
│   ├── whitelist.ts      # ホワイトリスト検証
│   └── middleware.ts     # 認証ミドルウェア
│
middleware.ts             # ルート保護
```

### ミドルウェア（ルート保護）

```typescript
// middleware.ts
export { auth as middleware } from "@/lib/auth/config";

export const config = {
  matcher: ["/articles/:path*"],
};
```

### セキュリティ考慮事項

- セッションはHTTP Only Cookieで管理
- CSRF対策はNextAuth.jsが自動で処理
- ホワイトリストは環境変数で管理（コードにハードコードしない）
- 本番環境ではHTTPS必須

---

## 機能一覧

### 1. 記事一覧

- 全記事の一覧表示
- ステータスでフィルタリング（下書き/公開済み/アーカイブ）
- キーワードでの検索
- 作成日/更新日でのソート

### 2. 記事作成

- タイトル入力
- 本文入力（Markdownエディタ）
- キーワード設定
- 下書き保存
- プレビュー

### 3. 記事編集

- 既存記事の編集
- 自動保存（オプション）
- 編集履歴

### 4. 記事削除

- 論理削除（アーカイブ）
- 確認ダイアログ

### 5. ステータス管理

- 下書き → 公開
- 公開 → 非公開
- アーカイブ

---

## 画面構成

### ルーティング

```
/articles              # 記事一覧
/articles/new          # 新規作成
/articles/[id]         # 記事詳細/プレビュー
/articles/[id]/edit    # 記事編集
```

### ワイヤーフレーム

#### 記事一覧 (`/articles`)

```
┌─────────────────────────────────────────────────────┐
│  記事管理                          [+ 新規作成]     │
├─────────────────────────────────────────────────────┤
│  [検索...        ]  [ステータス ▼]  [ソート ▼]     │
├─────────────────────────────────────────────────────┤
│  □ タイトル              ステータス    更新日       │
│  ─────────────────────────────────────────────────  │
│  □ iDeCoの始め方          公開済み    2024/01/20   │
│  □ 積立NISAガイド         下書き      2024/01/19   │
│  □ 健康管理の基本         下書き      2024/01/18   │
└─────────────────────────────────────────────────────┘
```

#### 記事編集 (`/articles/[id]/edit`)

```
┌─────────────────────────────────────────────────────┐
│  ← 戻る                    [プレビュー] [保存]     │
├─────────────────────────────────────────────────────┤
│  タイトル                                           │
│  ┌───────────────────────────────────────────────┐ │
│  │ iDeCoの始め方完全ガイド                       │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  キーワード                                         │
│  [iDeCo] [年金] [資産形成] [+追加]                 │
│                                                     │
│  本文                                               │
│  ┌───────────────────────────────────────────────┐ │
│  │ ## はじめに                                   │ │
│  │                                               │ │
│  │ iDeCo（個人型確定拠出年金）は...             │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ステータス: [下書き ▼]                            │
└─────────────────────────────────────────────────────┘
```

---

## データモデル

### Article

```typescript
interface Article {
  id: string;
  title: string;
  content: string;           // Markdown
  keywords: string[];
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

type ArticleStatus = 'draft' | 'published' | 'archived';
```

### データ永続化

**Phase 1**: ローカルストレージ（localStorage）
- シンプルな実装で素早く動作確認
- JSONでシリアライズ

**Phase 2**: データベース（将来）
- Supabase または PlanetScale
- Vercel Postgres

---

## コンポーネント構成

```
app/
├── articles/
│   ├── page.tsx              # 記事一覧
│   ├── new/
│   │   └── page.tsx          # 新規作成
│   └── [id]/
│       ├── page.tsx          # 記事詳細
│       └── edit/
│           └── page.tsx      # 記事編集
│
components/
├── articles/
│   ├── ArticleList.tsx       # 一覧コンポーネント
│   ├── ArticleCard.tsx       # 一覧のカード
│   ├── ArticleForm.tsx       # 作成/編集フォーム
│   ├── ArticlePreview.tsx    # プレビュー
│   ├── MarkdownEditor.tsx    # Markdownエディタ
│   └── KeywordInput.tsx      # キーワード入力
│
lib/
├── articles/
│   ├── types.ts              # 型定義
│   ├── storage.ts            # ローカルストレージ操作
│   └── validation.ts         # バリデーション
```

---

## 技術選定

### Markdownエディタ

- **候補1**: `@uiw/react-md-editor` - シンプルで軽量
- **候補2**: `react-simplemde-editor` - 機能豊富

### UIコンポーネント

- **候補1**: Tailwind CSS のみ - 軽量
- **候補2**: shadcn/ui - 高品質なコンポーネント

### 状態管理

- React Server Components + Client Components
- 必要に応じて `useState` / `useReducer`

---

## 実装ステップ

### Phase 0: 認証基盤

1. [ ] NextAuth.js のセットアップ
2. [ ] Google OAuth の設定（Google Cloud Console）
3. [ ] ログイン画面の実装
4. [ ] ホワイトリスト検証の実装
5. [ ] ミドルウェアによるルート保護

### Phase 1: 基本機能（MVP）

1. [ ] データモデル・型定義の作成
2. [ ] ローカルストレージのユーティリティ作成
3. [ ] 記事一覧ページの実装
4. [ ] 記事作成ページの実装
5. [ ] 記事編集ページの実装
6. [ ] 記事削除機能の実装

### Phase 2: UX改善

1. [ ] Markdownエディタの導入
2. [ ] プレビュー機能
3. [ ] 自動保存
4. [ ] 検索・フィルタリング

### Phase 3: 機能拡張

1. [ ] キーワードエージェントとの連携
2. [ ] データベース移行
3. [ ] 画像アップロード
4. [ ] エクスポート機能（HTML/PDF）

---

## API設計（将来のAPI Routes用）

```typescript
// GET /api/articles - 記事一覧取得
// POST /api/articles - 記事作成
// GET /api/articles/[id] - 記事詳細取得
// PUT /api/articles/[id] - 記事更新
// DELETE /api/articles/[id] - 記事削除
// PATCH /api/articles/[id]/status - ステータス変更
```

---

## 注意事項

- 初期実装はローカルストレージを使用するため、ブラウザを変えるとデータが失われる
- 本番運用にはデータベース移行が必要
- Markdownのサニタイズを忘れずに（XSS対策）

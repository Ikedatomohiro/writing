# 管理画面の記事管理 - 実装計画

## アーキテクチャ

```
管理画面 (admin pages)
  ↓ fetch
API Routes (/api/articles)
  ↓
lib/content/repository.ts  ← 新規: Supabase CRUD
  ↓
Supabase articles テーブル
  ↑
lib/content/reader.ts      ← 既存: 読み取り専用（ブログ用）
  ↑
lib/content/api.ts         ← 既存: ブログ表示用API
  ↑
ブログ表示 (public pages)
```

## 実装ステップ

### Step 1: Supabase CRUDリポジトリ追加
- `lib/content/repository.ts` を新規作成
- Supabase `articles` テーブルへの CRUD 操作を提供
- 既存の `reader.ts` の `toArticle` 変換ロジックを共有

### Step 2: APIスキーマ更新
- `lib/api/schemas.ts` を content 型に合わせて更新
- category, description, tags, published フィールドに対応

### Step 3: API Routes更新
- `app/api/articles/route.ts` で `lib/content/repository` を使用
- `app/api/articles/[id]` → `[slug]` にルート変更
- VercelBlobBackend への依存を削除

### Step 4: クライアントストレージ更新
- `lib/articles/storage.ts` を content 型に合わせて更新

### Step 5: コンポーネント更新
- `ArticleForm`: category, description, tags, thumbnail, published に対応
- `ArticleTable`: content Article 型に対応

### Step 6: 管理画面ページ更新
- `[id]` → `[slug]` にルートパラメータ変更
- content 型を使用

## リスク

- Supabase テーブルのスキーマ変更は不要（既存テーブルをそのまま使用）
- ブログ表示側は `lib/content/api.ts` 経由のため影響なし

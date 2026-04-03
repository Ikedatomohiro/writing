# 管理画面の記事管理 - 仕様書

## 目的

管理画面の記事CRUD（一覧・詳細・編集・削除・新規登録）を、ブログ表示と同じSupabaseの`articles`テーブルを使って行えるようにする。
既存の`lib/content/`モジュールを拡張し、データアクセスの分散を防ぐ。

## 背景

現在2つの独立した記事管理システムが存在する:
- **ブログ表示**: `lib/content/` → Supabase `articles`テーブル（読み取り専用）
- **管理画面**: `lib/articles/` → Vercel Blob JSON（独自の型定義）

これにより、型の不整合やデータの分散が発生している。

## 要件

### 機能要件

1. **記事一覧**: Supabaseから全記事（下書き含む）を取得・表示
2. **記事詳細**: slug指定で記事詳細を表示
3. **記事編集**: 既存記事のフィールドを更新
4. **記事削除**: 指定記事をSupabaseから削除
5. **記事新規登録**: 新規記事をSupabaseに登録

### 管理対象フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| slug | string | 自動生成 | UUID形式の識別子 |
| title | string | ○ | 記事タイトル |
| description | string | ○ | 記事説明 |
| content | string | - | 記事本文（MDX） |
| category | Category | ○ | asset / tech / health |
| tags | string[] | - | タグ一覧 |
| thumbnail | string | - | サムネイルURL |
| published | boolean | - | 公開状態（デフォルト: false） |
| date | string | 自動設定 | 作成日時（ISO 8601） |

### 非機能要件

- ブログ表示と同じ`lib/content/`モジュールを使用し、データアクセスロジックを一元化
- 管理画面は認証必須（既存のNextAuth認証を維持）
- APIバリデーションにZodを使用

## 成功基準

- 管理画面から記事のCRUD操作がすべて正常に動作する
- ブログ表示に影響がない（既存の公開記事取得ロジックはそのまま）
- `lib/articles/`の旧モジュールへの依存がなくなる

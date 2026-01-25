# Markdown/MDX記事管理 実装計画

## 実装ステップ

### Step 1: 依存パッケージのインストール

```bash
npm install next-mdx-remote gray-matter rehype-pretty-code shiki
```

- `next-mdx-remote`: MDXをServer Componentsでレンダリング
- `gray-matter`: フロントマターのパース
- `rehype-pretty-code`: シンタックスハイライト
- `shiki`: コードハイライトエンジン

### Step 2: 型定義の作成

`lib/content/types.ts`に型定義を作成:
- Category型
- ArticleMeta型
- Article型

### Step 3: 記事取得ユーティリティの作成

`lib/content/`ディレクトリに以下を作成:
- `parser.ts`: フロントマターのパース
- `reader.ts`: ファイル読み込み
- `api.ts`: 公開API（getArticlesByCategory等）

### Step 4: MDX設定

`lib/content/mdx.ts`にMDX設定を作成:
- rehypeプラグイン設定
- remarkプラグイン設定
- コンポーネントマッピング

### Step 5: サンプル記事の作成

`content/`ディレクトリにサンプル記事を作成:
- asset/sample-article.mdx
- tech/sample-article.mdx
- health/sample-article.mdx

## 影響を受けるファイル

### 新規作成

- `lib/content/types.ts`
- `lib/content/parser.ts`
- `lib/content/reader.ts`
- `lib/content/api.ts`
- `lib/content/mdx.ts`
- `lib/content/index.ts`
- `lib/content/api.test.ts`
- `content/asset/sample-article.mdx`
- `content/tech/sample-article.mdx`
- `content/health/sample-article.mdx`

### 変更

- `package.json`（依存追加）

## 依存関係

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5
```

## テスト計画

### ユニットテスト

- `parser.ts`: フロントマターのパーステスト
- `reader.ts`: ファイル読み込みテスト
- `api.ts`: 記事取得APIテスト

### 統合テスト

- サンプル記事を使った一覧取得テスト
- サンプル記事を使った詳細取得テスト

## リスクと対策

| リスク | 対策 |
|--------|------|
| ファイルパスの扱い | Node.js pathモジュールを使用 |
| MDXパースエラー | エラーハンドリングを適切に実装 |
| ビルド時のパフォーマンス | 必要に応じてキャッシュを検討 |

# Markdown/MDX記事管理 タスクリスト

## タスク一覧

### Phase 1: セットアップ

- [x] 1.1 依存パッケージをインストール
- [x] 1.2 contentディレクトリを作成
- [x] 1.3 lib/contentディレクトリを作成

### Phase 2: 型定義

- [x] 2.1 lib/content/types.tsを作成
  - Category型
  - ArticleMeta型
  - Article型
  - Frontmatter型

### Phase 3: パーサー実装（TDD）

- [x] 3.1 lib/content/parser.test.tsを作成
- [x] 3.2 テスト実行・失敗確認（Red）
- [x] 3.3 lib/content/parser.tsを実装（Green）
- [x] 3.4 リファクタリング

### Phase 4: ファイル読み込み実装（TDD）

- [x] 4.1 lib/content/reader.test.tsを作成
- [x] 4.2 テスト実行・失敗確認（Red）
- [x] 4.3 lib/content/reader.tsを実装（Green）
- [x] 4.4 リファクタリング

### Phase 5: API実装（TDD）

- [x] 5.1 lib/content/api.test.tsを作成
  - getArticlesByCategory
  - getAllArticles
  - getLatestArticles
  - getArticleBySlug
  - getRelatedArticles
- [x] 5.2 テスト実行・失敗確認（Red）
- [x] 5.3 lib/content/api.tsを実装（Green）
- [x] 5.4 リファクタリング

### Phase 6: MDX設定

- [x] 6.1 lib/content/mdx.tsを作成
- [x] 6.2 rehype-pretty-codeの設定
- [x] 6.3 ビルド確認

### Phase 7: サンプル記事

- [x] 7.1 content/asset/investment-basics.mdxを作成
- [x] 7.2 content/tech/typescript-tips.mdxを作成
- [x] 7.3 content/health/sleep-quality.mdxを作成

### Phase 8: エクスポート・最終確認

- [x] 8.1 lib/content/index.tsを作成
- [x] 8.2 全テスト実行
- [x] 8.3 ビルド確認

## 完了条件

| タスク | 完了条件 |
|--------|----------|
| Phase 2 | 型定義がコンパイルできる |
| Phase 3 | パーサーのテストが通る |
| Phase 4 | ファイル読み込みのテストが通る |
| Phase 5 | APIのテストが通る |
| Phase 6 | MDXがレンダリングできる |
| Phase 8 | 全テスト通過、ビルド成功 |

## spec.md照合

- [x] contentディレクトリにMDXファイルを配置 → Phase 1, 7
- [x] フロントマターからメタ情報を取得 → Phase 3
- [x] カテゴリ別に記事一覧を取得 → Phase 5
- [x] スラッグから記事詳細を取得 → Phase 5
- [x] MDXコンテンツをHTMLにレンダリング → Phase 6
- [x] 全テストが通る → Phase 8
- [x] ビルドが成功 → Phase 8

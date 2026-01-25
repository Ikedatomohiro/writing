# テーマシステム タスクリスト

## タスク一覧

### Phase 1: Tailwind CSS導入

- [x] 1.1 Tailwind CSS関連パッケージをインストール
- [x] 1.2 postcss.config.mjsを作成
- [x] 1.3 tailwind.config.tsを作成（基本設定のみ）
- [x] 1.4 app/globals.cssを作成（Tailwindインポート）
- [x] 1.5 app/layout.tsxでglobals.cssをインポート
- [x] 1.6 ビルド確認

### Phase 2: カラートークン定義

- [x] 2.1 globals.cssにベースカラーのCSS変数を定義
- [x] 2.2 globals.cssにカテゴリ別テーマカラーを定義
- [x] 2.3 tailwind.config.tsにカスタムカラーを追加
- [x] 2.4 ビルド確認

### Phase 3: テーマ切り替えロジック

- [x] 3.1 lib/theme/types.tsを作成（型定義）
- [x] 3.2 lib/theme/constants.tsを作成（テーマ定数）
- [x] 3.3 lib/theme/utils.tsを作成（パス判定関数）
- [x] 3.4 lib/theme/utils.test.tsを作成（テスト）
- [x] 3.5 テスト実行・確認
- [x] 3.6 app/providers.tsxでThemeProvider適用

### Phase 4: 最終確認

- [x] 4.1 全テスト実行（113件パス）
- [x] 4.2 ビルド確認
- [ ] 4.3 開発サーバーで動作確認（ユーザー確認待ち）

## 完了条件

各タスクの完了条件:

| タスク | 完了条件 |
|--------|----------|
| 1.6 | `npm run build` が成功 |
| 2.4 | CSS変数がブラウザで確認できる |
| 3.5 | テストがすべてパス |
| 4.2 | 最終ビルドが成功 |

## spec.md照合

- [x] CSS変数でカラートークン定義 → Phase 2
- [x] Tailwindでカスタムカラー使用 → Phase 2
- [x] URLパスでテーマ切り替え → Phase 3
- [x] ビルド成功 → Phase 4
- [x] テスト通過 → Phase 3, 4

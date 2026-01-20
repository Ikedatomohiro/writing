# Writing

記事作成支援のためのWebアプリとツール群。

## ディレクトリ構成

```
writing/
├── app/                     # Next.js App Router (ページ)
├── components/              # React コンポーネント
├── lib/                     # ユーティリティ、共通ロジック
├── public/                  # 静的ファイル
│
├── tools/                   # Python ツール群 (アプリとは独立)
│   ├── src/                 # ソースコード
│   │   ├── agents/          # LangChain/LangGraph エージェント
│   │   ├── models/          # データモデル
│   │   ├── tools/           # エージェント用ツール
│   │   └── common/          # 共通ユーティリティ
│   ├── tests/               # テスト
│   ├── spec/                # エージェント仕様
│   ├── configs/             # 設定ファイル
│   ├── scripts/             # スクリプト
│   └── data/                # データファイル
│
├── .claude/                 # Claude Code 設定
├── package.json             # Next.js 依存関係
├── next.config.ts           # Next.js 設定
└── tsconfig.json            # TypeScript 設定
```

## セットアップ

### Next.js (Webアプリ)

```bash
npm install
npm run dev
```

### Python ツール

```bash
cd tools
uv sync
uv run python main.py
```

## 開発コマンド

### Next.js

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run start    # 本番サーバー起動
```

### Python (tools/ ディレクトリ内で実行)

```bash
uv run python main.py     # 実行
uv run pytest             # テスト
uv run ruff check .       # リント
uv run ruff format .      # フォーマット
```

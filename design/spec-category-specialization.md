# カテゴリ専門化 仕様書 (Issue #42)

## 目的・背景

記事カテゴリ（資産形成・プログラミング・健康）ごとに専門用語・トーン・構成パターンを
調整し、各分野に適した記事を生成できるようにする。

## 要件

### 機能要件

1. **カテゴリ別設定ファイル**: `tools/config/categories/` に YAML 形式で配置
   - `asset.yaml`（資産形成）
   - `programming.yaml`（プログラミング）
   - `health.yaml`（健康）

2. **各YAMLの構成**:
   - `category.name`: カテゴリ日本語名
   - `category.slug`: カテゴリ識別子（英語）
   - `category.expertise`: 専門知識（topics, terminology_level）
   - `category.writing_style`: 文体設定（tone, structure, avoid）
   - `category.common_sections`: よく使うセクション名

3. **カテゴリ設定読み込みユーティリティ**:
   - slug でカテゴリ設定を取得
   - 全カテゴリ一覧を取得
   - 不正なslug指定時のエラーハンドリング

4. **Writerプロンプトへの注入**:
   - カテゴリ設定を Writer Agent のプロンプトに注入する仕組み
   - 切り口提案（AngleProposal）・計画（Planner）・執筆（Executor）に反映

### 非機能要件

- ペルソナ設定（#38）との整合性: 補完関係（上書きではない）
- 拡張性: 新カテゴリ追加が YAML ファイル追加のみで可能
- persona.yaml は触らない

## 入出力定義

### 入力
- WriterInput に `category` フィールド（slug）を追加（オプショナル）

### 出力
- 変更なし（WriterOutput はそのまま）

## 制約事項

- #38（ペルソナ管理）は並行開発中。persona.yaml に直接触れない
- カテゴリ設定はペルソナを「上書き」ではなく「補完」する設計
- 既存テストを壊さない

## 成功基準

- [ ] 3カテゴリの YAML ファイルが正しく読み込める
- [ ] カテゴリ slug で設定を取得できる
- [ ] Writer プロンプトにカテゴリ固有の情報が注入される
- [ ] カテゴリ未指定時は従来通り動作する（後方互換性）
- [ ] 全テストが通る

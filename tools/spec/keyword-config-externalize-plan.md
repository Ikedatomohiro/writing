# キーワード設定の外部化 実装計画

## 実装ステップ

### Phase 1: 設定ファイル基盤

1. **設定ファイルの作成**
   - `tools/config/keywords.yaml` を作成
   - 既存の3カテゴリ（資産形成、健康、エンジニア）を定義

2. **設定読み込みモジュールの作成**
   - `tools/src/common/keyword_config.py` を新規作成
   - Pydanticモデルで設定スキーマを定義
   - YAMLファイルの読み込み・バリデーション機能

### Phase 2: CLI対応

3. **CLIパーサーの実装**
   - `argparse` または `click` を使用
   - `main.py` にCLI引数処理を追加
   - `--category`, `--all`, `--list` オプション

### Phase 3: 統合・リファクタリング

4. **main.pyの修正**
   - ハードコードされた設定を削除
   - 設定ファイルからの読み込みに変更
   - 複数カテゴリの逐次実行対応

5. **テストの作成**
   - 設定読み込みのユニットテスト
   - CLIのテスト
   - 統合テスト

## 影響を受けるファイル

| ファイル | 変更内容 |
|----------|----------|
| `tools/main.py` | CLI引数処理、設定読み込み |
| `tools/src/common/keyword_config.py` | 新規作成 |
| `tools/config/keywords.yaml` | 新規作成 |
| `tools/tests/test_keyword_config.py` | 新規作成 |
| `tools/pyproject.toml` | PyYAML依存追加（必要な場合） |

## 依存関係

```
Phase 1 → Phase 2 → Phase 3
```

- Phase 2はPhase 1の設定読み込み機能に依存
- Phase 3はPhase 1, 2の両方に依存

## テスト計画

### ユニットテスト

- 設定ファイルの読み込み
- バリデーションエラーの検出
- デフォルト値の適用

### 統合テスト

- CLI引数からの実行
- 複数カテゴリの実行
- 設定ファイル不存在時のエラー

## リスクと対策

| リスク | 対策 |
|--------|------|
| YAML構文エラー | バリデーションでわかりやすいエラーメッセージ |
| 既存動作の破壊 | 既存テストを先に確認、段階的に移行 |
| PyYAML未インストール | pyproject.tomlに追加 |

## 工数見積もり

- Phase 1: 設定基盤
- Phase 2: CLI対応
- Phase 3: 統合・テスト

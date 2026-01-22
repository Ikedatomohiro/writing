# Subagent-Driven Development スキル導入タスク

## タスク一覧

### Phase 1: 依存スキルの導入

- [ ] **Task 1.1**: writing-plans スキルを追加
  - ディレクトリ作成: `.claude/skills/writing-plans/`
  - `SKILL.md` 作成（日本語description付き）
  - 完了条件: ファイルが存在し、YAML frontmatterが正しい

- [ ] **Task 1.2**: requesting-code-review スキルを追加
  - ディレクトリ作成: `.claude/skills/requesting-code-review/`
  - `SKILL.md` 作成（日本語description付き）
  - `code-reviewer.md` 作成
  - 完了条件: 両ファイルが存在し、YAML frontmatterが正しい

- [ ] **Task 1.3**: finishing-a-development-branch スキルを追加
  - ディレクトリ作成: `.claude/skills/finishing-a-development-branch/`
  - `SKILL.md` 作成（日本語description付き）
  - 完了条件: ファイルが存在し、YAML frontmatterが正しい

### Phase 2: メインスキルの導入

- [ ] **Task 2.1**: subagent-driven-development スキルを追加
  - ディレクトリ作成: `.claude/skills/subagent-driven-development/`
  - `SKILL.md` 作成（日本語description付き）
  - `implementer-prompt.md` 作成
  - `spec-reviewer-prompt.md` 作成
  - `code-quality-reviewer-prompt.md` 作成
  - 完了条件: 全4ファイルが存在し、依存スキルへの参照が正しい

### Phase 3: 動作確認

- [ ] **Task 3.1**: スキル認識確認
  - Claude Codeを再起動
  - スキル一覧に4つのスキルが表示されることを確認
  - 完了条件: 全スキルが認識される

## spec.md照合チェック

| 要件 | 対応タスク | カバー |
|------|-----------|--------|
| FR-1: スキルファイルの配置 | Task 1.1〜2.1 | [x] |
| FR-2: 日本語ローカライゼーション | 各Task | [x] |
| FR-3: プロジェクト固有の調整 | Task 2.1 | [x] |
| FR-4: スキル間の連携 | Task 2.1 | [x] |
| NFR-1: 既存スキルとの互換性 | 全Task | [x] |
| NFR-2: 保守性 | 全Task | [x] |
| 成功基準1: 4つのスキル配置 | Task 1.1〜2.1 | [x] |
| 成功基準2: スキル認識 | Task 3.1 | [x] |
| 成功基準3: ワークフロー実行可能 | Task 3.1 | [x] |
| 成功基準4: 既存スキル動作 | Task 3.1 | [x] |

全要件がタスクでカバーされています。

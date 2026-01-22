# Subagent-Driven Development スキル導入計画

## 実装ステップ

### Phase 1: 依存スキルの導入

#### Step 1.1: writing-plans スキルの追加
- `.claude/skills/writing-plans/SKILL.md` を作成
- descriptionを日本語化
- プロジェクト構造に合わせた調整

#### Step 1.2: requesting-code-review スキルの追加
- `.claude/skills/requesting-code-review/SKILL.md` を作成
- `.claude/skills/requesting-code-review/code-reviewer.md` を作成
- 既存の `code-reviewer` エージェントとの連携を考慮

#### Step 1.3: finishing-a-development-branch スキルの追加
- `.claude/skills/finishing-a-development-branch/SKILL.md` を作成
- descriptionを日本語化

### Phase 2: メインスキルの導入

#### Step 2.1: subagent-driven-development スキルの追加
- `.claude/skills/subagent-driven-development/SKILL.md` を作成
- `.claude/skills/subagent-driven-development/implementer-prompt.md` を作成
- `.claude/skills/subagent-driven-development/spec-reviewer-prompt.md` を作成
- `.claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md` を作成

### Phase 3: 動作確認

#### Step 3.1: スキル認識確認
- Claude Codeでスキルが認識されるか確認
- 各スキルの呼び出しテスト

## 影響を受けるファイル

### 新規作成
- `.claude/skills/writing-plans/SKILL.md`
- `.claude/skills/requesting-code-review/SKILL.md`
- `.claude/skills/requesting-code-review/code-reviewer.md`
- `.claude/skills/finishing-a-development-branch/SKILL.md`
- `.claude/skills/subagent-driven-development/SKILL.md`
- `.claude/skills/subagent-driven-development/implementer-prompt.md`
- `.claude/skills/subagent-driven-development/spec-reviewer-prompt.md`
- `.claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md`

### 変更なし
- `.claude/agents/code-reviewer.md` - 既存エージェントはそのまま維持
- `.claude/skills/pr-review/` - 既存スキルはそのまま維持

## 依存関係

```
subagent-driven-development
├── writing-plans
├── requesting-code-review
│   └── code-reviewer.md
└── finishing-a-development-branch
```

## リスクと対策

| リスク | 対策 |
|--------|------|
| 既存スキルとの競合 | pr-reviewはPRレビュー専用として維持、新スキルはタスク単位のレビュー用として棲み分け |
| スキル参照の不整合 | `superpowers:`プレフィックスをプロジェクト内参照に変更 |
| 日本語/英語の混在 | 重要な部分は日本語化、技術用語は英語を維持 |

## テスト計画

1. スキルファイルの構文確認（YAML frontmatter）
2. スキル一覧への表示確認
3. 各スキルの基本動作確認

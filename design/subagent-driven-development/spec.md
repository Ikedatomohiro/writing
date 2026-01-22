# Subagent-Driven Development スキル導入仕様書

## 概要

obra/superpowersリポジトリのsubagent-driven-developmentスキルと、その依存スキル3つをプロジェクトに導入する。

## 目的・背景

- 実装計画を効率的に実行するためのワークフローを確立
- タスクごとにフレッシュなサブエージェントを使用し、コンテキスト汚染を防止
- 2段階レビュー（仕様準拠→コード品質）により品質を担保

## 導入対象スキル

### 1. subagent-driven-development（メイン）

実装計画をタスク単位でサブエージェントに分配し、2段階レビューで品質を確保するワークフロー。

**構成ファイル**:
- `SKILL.md` - スキル定義
- `implementer-prompt.md` - 実装担当サブエージェント用プロンプト
- `spec-reviewer-prompt.md` - 仕様準拠レビュー用プロンプト
- `code-quality-reviewer-prompt.md` - コード品質レビュー用プロンプト

### 2. writing-plans（依存）

実装計画書を作成するスキル。

**構成ファイル**:
- `SKILL.md` - スキル定義

### 3. pr-review（依存）

コードレビューを依頼するスキル。

**構成ファイル**:
- `skill.md` - スキル定義（コードレビューガイドライン含む）

### 4. finishing-a-development-branch（依存）

開発ブランチ完了時の処理を行うスキル。

**構成ファイル**:
- `SKILL.md` - スキル定義

## 機能要件

### FR-1: スキルファイルの配置

各スキルを`.claude/skills/`配下に配置する。

| スキル | 配置先 |
|--------|--------|
| subagent-driven-development | `.claude/skills/subagent-driven-development/` |
| writing-plans | `.claude/skills/writing-plans/` |
| pr-review | `.claude/skills/pr-review/` |
| finishing-a-development-branch | `.claude/skills/finishing-a-development-branch/` |

### FR-2: 日本語ローカライゼーション

既存スキル（pr-review, project-status）に合わせ、description部分を日本語化する。

### FR-3: プロジェクト固有の調整

- ファイルパス参照をプロジェクト構造に合わせる
- 既存のpr-reviewスキル（`.claude/skills/pr-review/skill.md`）との整合性を確保

### FR-4: スキル間の連携

- 依存関係を正しく参照できるようにする
- 既存スキル（pr-review）との重複を整理

## 非機能要件

### NFR-1: 既存スキルとの互換性

既存の`pr-review`、`project-status`、`skill-creator`スキルに影響を与えない。

### NFR-2: 保守性

元のobraリポジトリの更新に追従しやすい構造を維持する。

## 制約事項

- Claude Codeのスキル仕様に従う（YAML frontmatter必須）
- 既存の`.claude/`ディレクトリ構造を維持

## 成功基準

1. 4つのスキルが正しく配置されている
2. `/`コマンドでスキルが認識される
3. subagent-driven-developmentワークフローが実行可能
4. 既存スキルが引き続き動作する

## 参照元

- https://github.com/obra/superpowers/tree/main/skills/subagent-driven-development
- https://github.com/obra/superpowers/tree/main/skills/writing-plans
- pr-review: `.claude/skills/pr-review/` (プロジェクト固有)
- https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch

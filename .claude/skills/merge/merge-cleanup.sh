#!/bin/bash
#
# merge-cleanup.sh - PRマージ後のクリーンアップスクリプト
#
# 使用方法:
#   ./scripts/merge-cleanup.sh <PR番号>
#
# 機能:
#   1. PRのマージ状態を確認
#   2. 関連Issueをクローズ（writing-taskリポジトリ）
#   3. worktreeを削除
#   4. ローカルブランチを削除
#

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# 引数チェック
if [ -z "$1" ]; then
    echo "使用方法: $0 <PR番号>"
    echo "例: $0 35"
    exit 1
fi

PR_NUMBER=$1
ISSUE_REPO="Ikedatomohiro/writing-task"

info "PR #${PR_NUMBER} のクリーンアップを開始します..."

# PRの状態を取得
PR_INFO=$(gh pr view "$PR_NUMBER" --json state,headRefName,body 2>/dev/null) || error "PR #${PR_NUMBER} が見つかりません"

PR_STATE=$(echo "$PR_INFO" | jq -r '.state')
BRANCH_NAME=$(echo "$PR_INFO" | jq -r '.headRefName')
PR_BODY=$(echo "$PR_INFO" | jq -r '.body')

info "ブランチ: $BRANCH_NAME"
info "PR状態: $PR_STATE"

# マージ済みか確認
if [ "$PR_STATE" != "MERGED" ]; then
    error "PR #${PR_NUMBER} はまだマージされていません (状態: $PR_STATE)"
fi

success "PRはマージ済みです"

# 関連Issueを抽出してクローズ
info "関連Issueを検出中..."
ISSUE_NUMBERS=$(echo "$PR_BODY" | grep -oEi '(close[sd]?|fix(e[sd])?|resolve[sd]?)\s*#[0-9]+' | grep -oE '[0-9]+' | sort -u)

if [ -n "$ISSUE_NUMBERS" ]; then
    for ISSUE_NUM in $ISSUE_NUMBERS; do
        info "Issue #${ISSUE_NUM} をクローズ中..."
        if gh issue close "$ISSUE_NUM" --repo "$ISSUE_REPO" 2>/dev/null; then
            success "Issue #${ISSUE_NUM} をクローズしました"
        else
            warn "Issue #${ISSUE_NUM} のクローズに失敗（既にクローズ済みか存在しない可能性）"
        fi
    done
else
    info "関連Issueは検出されませんでした"
fi

# メインリポジトリのパスを取得
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/.git$||')
CURRENT_DIR=$(pwd)

# worktree内にいるか確認
if [ "$CURRENT_DIR" != "$MAIN_REPO" ]; then
    info "worktree内で実行中。メインリポジトリに移動します..."
    cd "$MAIN_REPO"
    success "メインリポジトリに移動: $MAIN_REPO"
fi

# mainブランチに切り替えて更新
info "mainブランチを更新中..."
git checkout main 2>/dev/null || error "mainブランチへの切り替えに失敗"
git pull origin main || error "mainブランチの更新に失敗"
success "mainブランチを更新しました"

# worktreeを削除
WORKTREE_NAME=$(echo "$BRANCH_NAME" | tr '/' '-')
WORKTREE_PATH=".worktrees/$WORKTREE_NAME"

if [ -d "$WORKTREE_PATH" ]; then
    info "worktreeを削除中: $WORKTREE_PATH"
    git worktree remove "$WORKTREE_PATH" || warn "worktreeの削除に失敗"
    git worktree prune
    success "worktreeを削除しました"
else
    info "worktree ($WORKTREE_PATH) は存在しません"
fi

# ローカルブランチを削除
if git branch --list "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    info "ローカルブランチを削除中: $BRANCH_NAME"
    git branch -d "$BRANCH_NAME" 2>/dev/null || {
        warn "安全な削除に失敗。強制削除を試みます..."
        git branch -D "$BRANCH_NAME" || warn "ブランチの削除に失敗"
    }
    success "ローカルブランチを削除しました"
else
    info "ローカルブランチ ($BRANCH_NAME) は存在しません"
fi

# 結果サマリー
echo ""
echo "======================================"
echo -e "${GREEN}Merge and Cleanup 完了${NC}"
echo "======================================"
echo "PR:            #${PR_NUMBER}"
echo "ブランチ:       ${BRANCH_NAME}"
echo "関連Issue:     ${ISSUE_NUMBERS:-なし}"
echo "現在のブランチ: $(git branch --show-current)"
echo "======================================"

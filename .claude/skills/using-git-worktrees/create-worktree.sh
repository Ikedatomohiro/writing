#!/bin/bash
# Git Worktree作成スクリプト
# 使用法: ./create-worktree.sh <worktree名> [ブランチ名] [-b] [-f]
#   <worktree名>: .worktrees/配下に作成するディレクトリ名
#   [ブランチ名]: 使用するブランチ名（省略時はworktree名と同じ）
#   [-b]: 新規ブランチを作成する場合に指定
#   [-f]: 確認プロンプトをスキップ（Claude Code等の非対話環境用）

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルプ表示
show_help() {
    echo "Usage: $0 <worktree-name> [branch-name] [-b] [-f]"
    echo ""
    echo "Arguments:"
    echo "  <worktree-name>  Name of the worktree directory (created under .worktrees/)"
    echo "  [branch-name]    Branch name to use (defaults to worktree-name)"
    echo "  -b               Create a new branch"
    echo "  -f, --force      Skip confirmation prompts (for non-interactive environments)"
    echo ""
    echo "Examples:"
    echo "  $0 feature-auth                    # Use existing branch 'feature-auth'"
    echo "  $0 feature-auth -b                 # Create new branch 'feature-auth'"
    echo "  $0 my-worktree feature/auth -b    # Create new branch 'feature/auth'"
    echo "  $0 feature-auth -b -f             # Create with force (skip prompts)"
    exit 0
}

# 引数解析
WORKTREE_NAME=""
BRANCH_NAME=""
CREATE_NEW_BRANCH=false
FORCE_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -b)
            CREATE_NEW_BRANCH=true
            shift
            ;;
        -f|--force)
            FORCE_MODE=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            if [ -z "$WORKTREE_NAME" ]; then
                WORKTREE_NAME="$1"
            elif [ -z "$BRANCH_NAME" ]; then
                BRANCH_NAME="$1"
            fi
            shift
            ;;
    esac
done

# 引数チェック
if [ -z "$WORKTREE_NAME" ]; then
    echo -e "${RED}Error: worktree name is required${NC}"
    show_help
fi

# ブランチ名が指定されていない場合はworktree名を使用
if [ -z "$BRANCH_NAME" ]; then
    BRANCH_NAME="$WORKTREE_NAME"
fi

# リポジトリルートに移動
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

WORKTREE_PATH=".worktrees/$WORKTREE_NAME"

echo -e "${BLUE}=== Git Worktree Creation ===${NC}"
echo "Worktree: $WORKTREE_PATH"
echo "Branch: $BRANCH_NAME"
echo "New branch: $CREATE_NEW_BRANCH"
echo ""

# セーフティ検証
echo -e "${YELLOW}[1/6] Safety checks...${NC}"

# 未コミットの変更確認
UNCOMMITTED=$(git status --porcelain)
if [ -n "$UNCOMMITTED" ]; then
    echo -e "${YELLOW}Warning: Uncommitted changes detected:${NC}"
    echo "$UNCOMMITTED"
    if [ "$FORCE_MODE" = true ]; then
        echo -e "${YELLOW}Force mode enabled, continuing...${NC}"
    else
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Aborted.${NC}"
            exit 1
        fi
    fi
fi

# 既存worktree確認
if [ -d "$WORKTREE_PATH" ]; then
    echo -e "${RED}Error: Worktree already exists at $WORKTREE_PATH${NC}"
    exit 1
fi

# orphaned worktreeの検出とクリーンアップ
ORPHANED=$(git worktree prune --dry-run 2>&1)
if [ -n "$ORPHANED" ]; then
    echo -e "${YELLOW}Cleaning up orphaned worktrees...${NC}"
    git worktree prune
fi

echo -e "${GREEN}Safety checks passed.${NC}"

# worktree作成
echo -e "${YELLOW}[2/6] Creating worktree...${NC}"

mkdir -p .worktrees

if [ "$CREATE_NEW_BRANCH" = true ]; then
    git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
else
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
fi

echo -e "${GREEN}Worktree created.${NC}"

# 環境変数のコピー
echo -e "${YELLOW}[3/6] Copying environment files...${NC}"

ENV_STATUS="Not found"

if [ -f ".env" ]; then
    cp ".env" "$WORKTREE_PATH/.env"
    ENV_STATUS="Copied"
    echo "  .env -> $WORKTREE_PATH/.env"
fi

if [ -f ".env.local" ]; then
    cp ".env.local" "$WORKTREE_PATH/.env.local"
    echo "  .env.local -> $WORKTREE_PATH/.env.local"
fi

if [ -f "tools/.env" ] && [ -d "$WORKTREE_PATH/tools" ]; then
    cp "tools/.env" "$WORKTREE_PATH/tools/.env"
    echo "  tools/.env -> $WORKTREE_PATH/tools/.env"
fi

if [ "$ENV_STATUS" = "Not found" ]; then
    echo -e "${YELLOW}Warning: No .env files found to copy${NC}"
fi

# 依存関係のインストール
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"

cd "$WORKTREE_PATH"

DEP_STATUS=""

if [ -f "package.json" ]; then
    echo "  Installing npm packages..."
    npm install --loglevel=error
    DEP_STATUS="npm"
fi

if [ -f "pyproject.toml" ]; then
    echo "  Installing Python packages with uv..."
    uv sync --quiet
    if [ -n "$DEP_STATUS" ]; then
        DEP_STATUS="${DEP_STATUS}, uv"
    else
        DEP_STATUS="uv"
    fi
fi

if [ -f "tools/pyproject.toml" ]; then
    echo "  Installing tools Python packages with uv..."
    (cd tools && uv sync --quiet)
    if [ -n "$DEP_STATUS" ]; then
        DEP_STATUS="${DEP_STATUS}, tools/uv"
    else
        DEP_STATUS="tools/uv"
    fi
fi

if [ -z "$DEP_STATUS" ]; then
    DEP_STATUS="None"
fi

echo -e "${GREEN}Dependencies installed.${NC}"

# ベースラインテスト
echo -e "${YELLOW}[5/6] Running baseline tests...${NC}"

TEST_STATUS="SKIP"

if [ -f "package.json" ]; then
    echo "  Running npm build check..."
    if npm run build > /dev/null 2>&1; then
        TEST_STATUS="PASS"
        echo -e "  ${GREEN}npm build: OK${NC}"
    else
        TEST_STATUS="FAIL"
        echo -e "  ${RED}npm build: FAILED${NC}"
    fi
fi

if [ -f "tools/pyproject.toml" ]; then
    echo "  Running pytest collection..."
    if (cd tools && uv run pytest --co -q > /dev/null 2>&1); then
        echo -e "  ${GREEN}pytest collection: OK${NC}"
    else
        echo -e "  ${YELLOW}pytest collection: WARN${NC}"
    fi
fi

# 結果報告
echo -e "${YELLOW}[6/6] Summary${NC}"
echo ""
echo -e "${GREEN}=== Worktree Created ===${NC}"
echo ""
echo "| Item | Value |"
echo "|------|-------|"
echo "| Path | $WORKTREE_PATH |"
echo "| Branch | $BRANCH_NAME |"
echo "| Environment | $ENV_STATUS |"
echo "| Dependencies | $DEP_STATUS |"
echo "| Tests | $TEST_STATUS |"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  cd $WORKTREE_PATH"
echo ""

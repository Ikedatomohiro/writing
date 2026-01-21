"""エントリーポイント"""

import argparse
import sys

from src.agents.keyword_finder import (
    KeywordSearchInput,
    run_keyword_finder,
)
from src.common import get_logger, load_keyword_config
from src.common.config import settings
from src.storage import KeywordStorageService, get_storage_backend

logger = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    """コマンドライン引数をパース"""
    parser = argparse.ArgumentParser(
        description="キーワード検索エージェント",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "-c",
        "--category",
        action="append",
        dest="categories",
        help="実行するカテゴリ（複数指定可）",
    )
    parser.add_argument(
        "-a",
        "--all",
        action="store_true",
        dest="run_all",
        help="全カテゴリを実行",
    )
    parser.add_argument(
        "-l",
        "--list",
        action="store_true",
        dest="list_categories",
        help="利用可能なカテゴリ一覧を表示",
    )
    return parser.parse_args()


def list_categories() -> None:
    """カテゴリ一覧を表示"""
    config = load_keyword_config()
    print("利用可能なカテゴリ:")
    print("-" * 40)
    for name, category in config.categories.items():
        print(f"  {name}")
        print(f"    説明: {category.description}")
        print(f"    シードキーワード: {', '.join(category.seed_keywords)}")
        print()


def run_category(category_name: str) -> None:
    """指定カテゴリでキーワード検索を実行"""
    config = load_keyword_config()
    category = config.get_category(category_name)

    input_data = KeywordSearchInput(
        category=category_name,
        seed_keywords=category.seed_keywords,
        depth=category.depth,
    )

    logger.info(f"入力: {input_data}")

    # エージェントを実行
    result = run_keyword_finder(input_data)

    # 結果を出力
    print("\n" + "=" * 60)
    print("キーワード検索結果")
    print("=" * 60)
    print(f"\n分野: {result.category}")
    print(f"シードキーワード: {', '.join(result.seed_keywords)}")
    print(f"\n発見したキーワード: {len(result.results)}個")
    print("-" * 40)

    for kw in result.results:
        print(f"\n【{kw.keyword}】")
        print(f"  競合度: {kw.competition}")
        print(f"  関連度: {kw.relevance_score:.2f}")
        if kw.suggested_topics:
            print(f"  トピック案: {', '.join(kw.suggested_topics)}")

    print("\n" + "-" * 40)
    print(f"サマリー: {result.summary}")
    print("=" * 60)

    # ストレージに保存
    backend = get_storage_backend()
    service = KeywordStorageService(backend)
    run_id = service.save_search_result(result)

    storage_type = "Vercel Blob" if settings.is_github_actions else "ローカルファイル"
    print(f"\n保存先: {storage_type}")
    print(f"実行ID: {run_id}")
    if not settings.is_github_actions:
        print(f"ファイル: {settings.keywords_file}")


def main() -> None:
    """メイン関数"""
    args = parse_args()

    # カテゴリ一覧表示
    if args.list_categories:
        list_categories()
        return

    # 実行するカテゴリを決定
    config = load_keyword_config()

    if args.run_all:
        categories_to_run = config.list_categories()
    elif args.categories:
        categories_to_run = args.categories
    else:
        # 引数なしの場合はヘルプを表示
        print("カテゴリを指定してください。")
        print()
        print("使用方法:")
        print("  uv run python main.py --category 資産形成")
        print("  uv run python main.py --all")
        print("  uv run python main.py --list")
        print()
        print("詳細は --help を参照してください。")
        sys.exit(1)

    # 各カテゴリを実行
    for category_name in categories_to_run:
        try:
            run_category(category_name)
        except KeyError as e:
            print(f"エラー: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()

"""エントリーポイント"""


from src.agents.keyword_finder import (
    KeywordSearchInput,
    run_keyword_finder,
)
from src.common import get_logger
from src.common.config import settings
from src.storage import KeywordStorageService, get_storage_backend

logger = get_logger(__name__)


def main():
    """キーワード検索エージェントを実行"""
    # サンプル入力
    input_data = KeywordSearchInput(
        category="資産形成",
        seed_keywords=["iDeCo", "積立NISA"],
        depth=2,
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


if __name__ == "__main__":
    main()

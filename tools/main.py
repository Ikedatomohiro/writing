"""エントリーポイント"""

import json

from src.agents.keyword_finder import (
    KeywordSearchInput,
    run_keyword_finder,
)
from src.common import get_logger

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


if __name__ == "__main__":
    main()

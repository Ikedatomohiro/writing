"""評価エージェント エントリーポイント"""

import argparse
import sys

from src.agents.evaluator import (
    EvaluationInput,
    EvaluationOutput,
    run_evaluator,
)
from src.common import get_logger

logger = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    """コマンドライン引数をパース"""
    parser = argparse.ArgumentParser(
        description="評価エージェント - 対象を自動評価します",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # 記事を評価
  uv run python evaluate.py --target "記事のテキスト" --type article --request "SEOの観点から評価して"

  # ファイルから読み込んで評価
  uv run python evaluate.py --file article.txt --type article --request "品質を評価して"

  # URLを評価（サービス）
  uv run python evaluate.py --target "https://example.com" --type service --request "使いやすさを評価して"
""",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "-t",
        "--target",
        help="評価対象（テキストまたはURL）",
    )
    group.add_argument(
        "-f",
        "--file",
        help="評価対象のファイルパス",
    )
    parser.add_argument(
        "--type",
        choices=["article", "service", "product", "other"],
        default="article",
        help="評価対象の種類（デフォルト: article）",
    )
    parser.add_argument(
        "-r",
        "--request",
        required=True,
        help="評価してほしい内容",
    )
    parser.add_argument(
        "-c",
        "--context",
        help="追加コンテキスト（任意）",
    )
    return parser.parse_args()


def print_result(result: EvaluationOutput) -> None:
    """評価結果を出力"""
    print("\n" + "=" * 60)
    print("評価結果")
    print("=" * 60)

    print(f"\n対象: {result.target_summary}")
    print(f"種類: {result.target_type}")
    print(f"\n総合スコア: {result.overall_score}/100")

    print("\n" + "-" * 40)
    print("基準別スコア")
    print("-" * 40)
    for score in result.criterion_scores:
        print(f"\n【{score.criterion}】 {score.score}/100")
        print(f"  根拠: {score.rationale}")

    print("\n" + "-" * 40)
    print("長所")
    print("-" * 40)
    for strength in result.strengths:
        print(f"  + {strength}")

    print("\n" + "-" * 40)
    print("短所")
    print("-" * 40)
    for weakness in result.weaknesses:
        print(f"  - {weakness}")

    print("\n" + "-" * 40)
    print("改善点")
    print("-" * 40)
    for improvement in result.improvements:
        print(f"  * {improvement}")

    print("\n" + "-" * 40)
    print(f"サマリー: {result.summary}")
    print("=" * 60)


def main() -> None:
    """メイン関数"""
    args = parse_args()

    # 評価対象を取得
    if args.file:
        try:
            with open(args.file, encoding="utf-8") as f:
                target = f.read()
        except FileNotFoundError:
            print(f"エラー: ファイルが見つかりません: {args.file}", file=sys.stderr)
            sys.exit(1)
        except PermissionError:
            print(f"エラー: ファイルへのアクセス権限がありません: {args.file}", file=sys.stderr)
            sys.exit(1)
        except (OSError, IOError) as e:
            print(f"エラー: ファイル読み込みに失敗: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        target = args.target

    # 入力データを作成
    input_data = EvaluationInput(
        target=target,
        target_type=args.type,
        evaluation_request=args.request,
        context=args.context,
    )

    logger.info(f"評価開始: {args.type}")
    logger.debug(f"対象: {target[:100]}...")
    logger.debug(f"リクエスト: {args.request}")

    # エージェントを実行
    try:
        result = run_evaluator(input_data)
        print_result(result)
    except Exception as e:
        logger.error(f"評価に失敗しました: {e}")
        print(f"エラー: 評価に失敗しました: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

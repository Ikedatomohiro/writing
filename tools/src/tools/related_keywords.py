"""関連キーワード取得ツールモジュール"""

import httpx
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from src.common import SearchError, get_logger

logger = get_logger(__name__)


class RelatedKeywordsInput(BaseModel):
    """関連キーワード取得の入力スキーマ"""

    keyword: str = Field(description="基となるキーワード")


@tool(args_schema=RelatedKeywordsInput)
def get_related_keywords(keyword: str) -> list[str]:
    """Googleサジェストから関連キーワードを取得する

    Args:
        keyword: 基となるキーワード

    Returns:
        関連キーワードのリスト
    """
    logger.info(f"関連キーワード取得開始: keyword='{keyword}'")

    try:
        suggestions = _get_google_suggestions(keyword)
        logger.info(f"関連キーワード取得完了: {len(suggestions)}件")
        return suggestions
    except Exception as e:
        logger.error(f"関連キーワード取得エラー: {e}")
        raise SearchError(f"関連キーワードの取得に失敗しました: {e}") from e


def _get_google_suggestions(keyword: str) -> list[str]:
    """Googleサジェストを取得する"""
    url = "https://www.google.com/complete/search"
    params = {
        "q": keyword,
        "client": "firefox",
        "hl": "ja",
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        # レスポンス形式: [query, [suggestions...]]
        if isinstance(data, list) and len(data) >= 2:
            return data[1]
        return []
    except Exception as e:
        logger.warning(f"Googleサジェスト取得失敗: {e}、モック結果を返します")
        return _mock_suggestions(keyword)


def _mock_suggestions(keyword: str) -> list[str]:
    """モックサジェストを返す（開発用）"""
    suffixes = [
        "とは",
        "始め方",
        "おすすめ",
        "比較",
        "メリット",
        "デメリット",
        "やり方",
        "2024",
        "初心者",
        "ランキング",
    ]
    return [f"{keyword} {suffix}" for suffix in suffixes]

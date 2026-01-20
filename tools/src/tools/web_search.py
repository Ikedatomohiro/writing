"""Web検索ツールモジュール"""

import httpx
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from src.common import SearchError, get_logger, settings

logger = get_logger(__name__)


class SearchResult(BaseModel):
    """検索結果"""

    title: str
    link: str
    snippet: str


class WebSearchInput(BaseModel):
    """Web検索の入力スキーマ"""

    query: str = Field(description="検索クエリ")
    num_results: int = Field(default=10, description="取得する結果数")


@tool(args_schema=WebSearchInput)
def search_web(query: str, num_results: int = 10) -> list[SearchResult]:
    """Webからキーワードに関連する情報を検索する

    Args:
        query: 検索クエリ
        num_results: 取得する結果数

    Returns:
        検索結果のリスト
    """
    logger.info(f"Web検索開始: query='{query}', num_results={num_results}")

    if not settings.serpapi_api_key:
        logger.warning("SERPAPI_API_KEY が設定されていません。モック結果を返します。")
        return _mock_search_results(query, num_results)

    try:
        results = _search_with_serpapi(query, num_results)
        logger.info(f"Web検索完了: {len(results)}件の結果を取得")
        return results
    except Exception as e:
        logger.error(f"Web検索エラー: {e}")
        raise SearchError(f"Web検索に失敗しました: {e}") from e


def _search_with_serpapi(query: str, num_results: int) -> list[SearchResult]:
    """SerpAPIを使用して検索を実行する"""
    url = "https://serpapi.com/search"
    params = {
        "q": query,
        "api_key": settings.serpapi_api_key,
        "engine": "google",
        "num": num_results,
        "hl": "ja",
        "gl": "jp",
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("organic_results", [])[:num_results]:
        results.append(
            SearchResult(
                title=item.get("title", ""),
                link=item.get("link", ""),
                snippet=item.get("snippet", ""),
            )
        )

    return results


def _mock_search_results(query: str, num_results: int) -> list[SearchResult]:
    """モック検索結果を返す（開発用）"""
    mock_data = [
        SearchResult(
            title=f"{query}に関する記事1",
            link=f"https://example.com/{query.replace(' ', '-')}-1",
            snippet=f"{query}についての詳細な解説記事です。初心者にもわかりやすく説明しています。",
        ),
        SearchResult(
            title=f"{query}の始め方ガイド",
            link=f"https://example.com/{query.replace(' ', '-')}-guide",
            snippet=f"{query}を始めるための完全ガイド。ステップバイステップで解説します。",
        ),
        SearchResult(
            title=f"【2024年版】{query}おすすめ比較",
            link=f"https://example.com/{query.replace(' ', '-')}-comparison",
            snippet=f"最新の{query}を徹底比較。あなたに最適な選択肢を見つけましょう。",
        ),
    ]
    return mock_data[:num_results]

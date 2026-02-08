"""Unsplash API client for stock photo search."""

import os

import httpx

from src.common import get_logger

logger = get_logger(__name__)

UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"
REQUEST_TIMEOUT = 10


def search_unsplash_photos(
    query: str, per_page: int = 5
) -> list[dict]:
    """Unsplash APIで写真を検索する。

    Args:
        query: 検索クエリ（英語推奨）
        per_page: 取得件数（最大30）

    Returns:
        写真情報の辞書リスト。APIキー未設定やエラー時は空リスト。
        各辞書のキー: photo_id, url, thumbnail_url, photographer,
                      photographer_url, description
    """
    access_key = os.environ.get("UNSPLASH_ACCESS_KEY", "")
    if not access_key:
        logger.info("UNSPLASH_ACCESS_KEY未設定。画像検索をスキップ")
        return []

    try:
        response = httpx.get(
            UNSPLASH_API_URL,
            params={"query": query, "per_page": per_page},
            headers={"Authorization": f"Client-ID {access_key}"},
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
    except httpx.TimeoutException:
        logger.warning(f"Unsplash APIタイムアウト: query='{query}'")
        return []
    except httpx.HTTPStatusError as e:
        logger.warning(f"Unsplash APIエラー: {e.response.status_code}")
        return []

    data = response.json()
    return _parse_results(data.get("results", []))


def _parse_results(results: list[dict]) -> list[dict]:
    """APIレスポンスを写真情報辞書リストに変換する。"""
    photos = []
    for item in results:
        photo = {
            "photo_id": item["id"],
            "url": item["urls"]["regular"],
            "thumbnail_url": item["urls"]["thumb"],
            "photographer": item["user"]["name"],
            "photographer_url": item["user"]["links"]["html"],
            "description": item.get("description"),
        }
        photos.append(photo)
    return photos

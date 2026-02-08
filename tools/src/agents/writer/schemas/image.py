"""Writer agent image suggestion schemas."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class UnsplashPhoto(BaseModel):
    """Unsplash APIから取得した写真情報"""

    photo_id: str = Field(description="Unsplash写真ID")
    url: str = Field(description="写真URL（regular サイズ）")
    thumbnail_url: str = Field(description="サムネイルURL")
    photographer: str = Field(description="撮影者名")
    photographer_url: str = Field(description="撮影者のUnsplashプロフィールURL")
    description: str | None = Field(
        default=None, description="写真の説明"
    )


class ImageSuggestion(BaseModel):
    """個別の画像提案"""

    purpose: Literal["eyecatch", "inline", "ogp"] = Field(
        description="画像の用途"
    )
    search_query: str = Field(description="使用した検索クエリ")
    photos: list[UnsplashPhoto] = Field(
        default_factory=list, description="検索結果の写真リスト"
    )
    selected_photo: UnsplashPhoto | None = Field(
        default=None, description="選択された写真"
    )
    alt_text: str = Field(description="画像のalt属性テキスト")
    section_heading: str | None = Field(
        default=None, description="対応するセクション見出し（inline用）"
    )


class ImageSuggestions(BaseModel):
    """画像提案のまとめ"""

    eyecatch: ImageSuggestion = Field(description="アイキャッチ画像")
    inline_images: list[ImageSuggestion] = Field(
        default_factory=list, description="本文挿入画像リスト"
    )
    ogp: ImageSuggestion | None = Field(
        default=None, description="OGP画像（Noneの場合はアイキャッチと兼用）"
    )


class ImageSearchQuery(BaseModel):
    """LLMが生成する画像検索クエリ"""

    eyecatch_query: str = Field(
        description="アイキャッチ画像の検索クエリ（英語）"
    )
    inline_queries: list[dict] = Field(
        default_factory=list,
        description="本文挿入画像の検索クエリリスト（各要素は heading と query を持つ）",
    )
    ogp_query: str | None = Field(
        default=None,
        description="OGP画像の検索クエリ（英語）。Noneの場合はアイキャッチと兼用",
    )

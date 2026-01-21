"""キーワード設定読み込みのテスト"""

from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest
import yaml

from src.common.keyword_config import (
    CategoryConfig,
    KeywordConfig,
    load_keyword_config,
)


class TestCategoryConfig:
    """CategoryConfigのテスト"""

    def test_valid_category(self):
        """正常なカテゴリ設定"""
        config = CategoryConfig(
            description="テスト",
            seed_keywords=["keyword1", "keyword2"],
            depth=2,
        )
        assert config.description == "テスト"
        assert config.seed_keywords == ["keyword1", "keyword2"]
        assert config.depth == 2

    def test_default_depth(self):
        """デフォルトのdepth値"""
        config = CategoryConfig(seed_keywords=["keyword1"])
        assert config.depth == 2

    def test_empty_seed_keywords_raises_error(self):
        """シードキーワードが空の場合エラー"""
        with pytest.raises(ValueError):
            CategoryConfig(seed_keywords=[])

    def test_invalid_depth_raises_error(self):
        """不正なdepth値でエラー"""
        with pytest.raises(ValueError):
            CategoryConfig(seed_keywords=["keyword1"], depth=0)
        with pytest.raises(ValueError):
            CategoryConfig(seed_keywords=["keyword1"], depth=4)


class TestKeywordConfig:
    """KeywordConfigのテスト"""

    def test_get_category(self):
        """カテゴリ取得"""
        config = KeywordConfig(
            categories={
                "テスト": CategoryConfig(seed_keywords=["keyword1"]),
            }
        )
        category = config.get_category("テスト")
        assert category.seed_keywords == ["keyword1"]

    def test_get_category_not_found(self):
        """存在しないカテゴリでエラー"""
        config = KeywordConfig(
            categories={
                "テスト": CategoryConfig(seed_keywords=["keyword1"]),
            }
        )
        with pytest.raises(KeyError) as exc_info:
            config.get_category("存在しない")
        assert "存在しない" in str(exc_info.value)
        assert "テスト" in str(exc_info.value)

    def test_list_categories(self):
        """カテゴリ一覧取得"""
        config = KeywordConfig(
            categories={
                "カテゴリA": CategoryConfig(seed_keywords=["a"]),
                "カテゴリB": CategoryConfig(seed_keywords=["b"]),
            }
        )
        categories = config.list_categories()
        assert set(categories) == {"カテゴリA", "カテゴリB"}


class TestLoadKeywordConfig:
    """load_keyword_configのテスト"""

    def test_load_valid_config(self):
        """正常な設定ファイルの読み込み"""
        config_data = {
            "version": "1.0",
            "categories": {
                "資産形成": {
                    "description": "テスト",
                    "seed_keywords": ["iDeCo", "新NISA"],
                    "depth": 2,
                }
            },
        }

        with NamedTemporaryFile(
            mode="w", suffix=".yaml", delete=False, encoding="utf-8"
        ) as f:
            yaml.dump(config_data, f, allow_unicode=True)
            temp_path = Path(f.name)

        try:
            config = load_keyword_config(temp_path)
            assert config.version == "1.0"
            assert "資産形成" in config.categories
            category = config.get_category("資産形成")
            assert category.seed_keywords == ["iDeCo", "新NISA"]
        finally:
            temp_path.unlink()

    def test_file_not_found(self):
        """存在しないファイルでエラー"""
        with pytest.raises(FileNotFoundError):
            load_keyword_config(Path("/nonexistent/config.yaml"))

    def test_empty_file_raises_error(self):
        """空のファイルでエラー"""
        with NamedTemporaryFile(
            mode="w", suffix=".yaml", delete=False, encoding="utf-8"
        ) as f:
            f.write("")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError) as exc_info:
                load_keyword_config(temp_path)
            assert "空です" in str(exc_info.value)
        finally:
            temp_path.unlink()

    def test_load_actual_config(self):
        """実際の設定ファイルを読み込めることを確認"""
        from src.common.keyword_config import get_config_path

        config_path = get_config_path()
        if config_path.exists():
            config = load_keyword_config()
            assert len(config.categories) > 0
            assert "資産形成" in config.categories

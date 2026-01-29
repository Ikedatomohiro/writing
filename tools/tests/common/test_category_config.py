"""カテゴリ設定モジュールのテスト."""

from pathlib import Path

import pytest
import yaml

from src.common.category_config import (
    CategorySpecConfig,
    load_category_config,
    load_all_categories,
    get_category_config_dir,
)


@pytest.fixture
def sample_category_data() -> dict:
    """テスト用カテゴリ設定データ."""
    return {
        "category": {
            "name": "資産形成",
            "slug": "asset",
            "expertise": {
                "topics": [
                    "投資信託、ETF、個別株",
                    "NISA、iDeCo",
                ],
                "terminology_level": "初心者向けに噛み砕く",
            },
            "writing_style": {
                "tone": "安心感を与える、煽らない",
                "structure": [
                    "結論ファースト",
                    "具体的な数字を示す",
                ],
                "avoid": [
                    "絶対儲かる",
                    "今すぐ始めないと損",
                ],
            },
            "common_sections": [
                "この記事でわかること",
                "注意点・リスク",
            ],
        }
    }


@pytest.fixture
def category_yaml_file(tmp_path: Path, sample_category_data: dict) -> Path:
    """テスト用YAMLファイルを作成するfixture."""
    yaml_path = tmp_path / "asset.yaml"
    with yaml_path.open("w", encoding="utf-8") as f:
        yaml.dump(sample_category_data, f, allow_unicode=True)
    return yaml_path


@pytest.fixture
def category_dir_with_files(tmp_path: Path) -> Path:
    """複数カテゴリYAMLを含むディレクトリを作成するfixture."""
    categories_dir = tmp_path / "categories"
    categories_dir.mkdir()

    configs = {
        "asset.yaml": {
            "category": {
                "name": "資産形成",
                "slug": "asset",
                "expertise": {
                    "topics": ["投資信託"],
                    "terminology_level": "初心者向け",
                },
                "writing_style": {
                    "tone": "安心感",
                    "structure": ["結論ファースト"],
                    "avoid": ["煽り表現"],
                },
                "common_sections": ["まとめ"],
            }
        },
        "programming.yaml": {
            "category": {
                "name": "プログラミング",
                "slug": "programming",
                "expertise": {
                    "topics": ["Python", "Web開発"],
                    "terminology_level": "技術者向け",
                },
                "writing_style": {
                    "tone": "論理的・実践的",
                    "structure": ["問題提示→解決策"],
                    "avoid": ["曖昧な表現"],
                },
                "common_sections": ["実装例"],
            }
        },
        "health.yaml": {
            "category": {
                "name": "健康",
                "slug": "health",
                "expertise": {
                    "topics": ["運動", "睡眠"],
                    "terminology_level": "一般向け",
                },
                "writing_style": {
                    "tone": "親しみやすい",
                    "structure": ["体験談ベース"],
                    "avoid": ["医学的断定"],
                },
                "common_sections": ["注意点"],
            }
        },
    }

    for filename, data in configs.items():
        path = categories_dir / filename
        with path.open("w", encoding="utf-8") as f:
            yaml.dump(data, f, allow_unicode=True)

    return categories_dir


class TestCategorySpecConfig:
    """CategorySpecConfig のテスト."""

    def test_valid_config(self, sample_category_data: dict):
        config = CategorySpecConfig.model_validate(
            sample_category_data["category"]
        )
        assert config.name == "資産形成"
        assert config.slug == "asset"
        assert len(config.expertise.topics) == 2
        assert config.writing_style.tone == "安心感を与える、煽らない"
        assert len(config.writing_style.structure) == 2
        assert len(config.writing_style.avoid) == 2
        assert len(config.common_sections) == 2

    def test_slug_not_empty(self):
        with pytest.raises(ValueError):
            CategorySpecConfig(
                name="テスト",
                slug="",
                expertise={"topics": ["t"], "terminology_level": "l"},
                writing_style={"tone": "t", "structure": ["s"], "avoid": ["a"]},
                common_sections=["s"],
            )

    def test_topics_not_empty(self):
        with pytest.raises(ValueError):
            CategorySpecConfig(
                name="テスト",
                slug="test",
                expertise={"topics": [], "terminology_level": "l"},
                writing_style={"tone": "t", "structure": ["s"], "avoid": ["a"]},
                common_sections=["s"],
            )

    def test_to_prompt_context(self, sample_category_data: dict):
        """プロンプト用コンテキスト文字列を生成できること."""
        config = CategorySpecConfig.model_validate(
            sample_category_data["category"]
        )
        context = config.to_prompt_context()
        assert "資産形成" in context
        assert "投資信託、ETF、個別株" in context
        assert "安心感を与える、煽らない" in context
        assert "結論ファースト" in context
        assert "絶対儲かる" in context
        assert "この記事でわかること" in context


class TestLoadCategoryConfig:
    """load_category_config のテスト."""

    def test_load_valid_yaml(self, category_yaml_file: Path):
        config = load_category_config(category_yaml_file)
        assert config.slug == "asset"
        assert config.name == "資産形成"

    def test_load_nonexistent_file(self, tmp_path: Path):
        with pytest.raises(FileNotFoundError):
            load_category_config(tmp_path / "nonexistent.yaml")

    def test_load_empty_file(self, tmp_path: Path):
        empty_file = tmp_path / "empty.yaml"
        empty_file.write_text("")
        with pytest.raises(ValueError):
            load_category_config(empty_file)


class TestLoadAllCategories:
    """load_all_categories のテスト."""

    def test_load_all(self, category_dir_with_files: Path):
        categories = load_all_categories(category_dir_with_files)
        assert len(categories) == 3
        assert "asset" in categories
        assert "programming" in categories
        assert "health" in categories
        assert categories["asset"].name == "資産形成"
        assert categories["programming"].name == "プログラミング"
        assert categories["health"].name == "健康"

    def test_load_empty_dir(self, tmp_path: Path):
        empty_dir = tmp_path / "empty"
        empty_dir.mkdir()
        categories = load_all_categories(empty_dir)
        assert len(categories) == 0

    def test_load_nonexistent_dir(self, tmp_path: Path):
        with pytest.raises(FileNotFoundError):
            load_all_categories(tmp_path / "nonexistent")


class TestGetCategoryConfigDir:
    """get_category_config_dir のテスト."""

    def test_returns_path(self):
        path = get_category_config_dir()
        assert isinstance(path, Path)
        assert path.name == "categories"

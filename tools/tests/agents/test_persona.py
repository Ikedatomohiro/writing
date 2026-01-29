"""Persona management tests."""

from pathlib import Path
from unittest.mock import patch

import pytest
import yaml


# =============================================================================
# PersonaConfig Schema Tests
# =============================================================================


class TestWritingStyle:
    """WritingStyle schema tests"""

    def test_valid_writing_style(self):
        from src.agents.writer.schemas.persona import WritingStyle

        style = WritingStyle(
            tone="親しみやすいが論理的",
            target_audience="20-40代の投資初心者",
            avoid=["煽り表現", "過度な専門用語"],
        )
        assert style.tone == "親しみやすいが論理的"
        assert style.target_audience == "20-40代の投資初心者"
        assert len(style.avoid) == 2

    def test_default_avoid_is_empty(self):
        from src.agents.writer.schemas.persona import WritingStyle

        style = WritingStyle(
            tone="informative",
            target_audience="一般読者",
        )
        assert style.avoid == []


class TestPersonaConfig:
    """PersonaConfig schema tests"""

    def test_valid_persona(self):
        from src.agents.writer.schemas.persona import PersonaConfig, WritingStyle

        persona = PersonaConfig(
            name="テスト著者",
            background="元エンジニア、10年の実務経験",
            values=["実践重視", "再現性のある方法を推奨"],
            writing_style=WritingStyle(
                tone="親しみやすいが論理的",
                target_audience="20-40代の投資初心者",
                avoid=["煽り表現"],
            ),
            unique_perspectives=["エンジニア視点での解説"],
            category_expertise={"programming": "実務でのコード経験"},
        )
        assert persona.name == "テスト著者"
        assert len(persona.values) == 2

    def test_default_optional_fields(self):
        from src.agents.writer.schemas.persona import PersonaConfig, WritingStyle

        persona = PersonaConfig(
            name="最小構成著者",
            background="テスト用",
            values=[],
            writing_style=WritingStyle(
                tone="informative",
                target_audience="一般読者",
            ),
        )
        assert persona.unique_perspectives == []
        assert persona.category_expertise == {}


# =============================================================================
# Persona Loading Tests
# =============================================================================


class TestLoadPersona:
    """load_persona function tests"""

    def test_load_persona_from_yaml(self, tmp_path):
        from src.agents.writer.schemas.persona import load_persona

        persona_data = {
            "persona": {
                "name": "テスト著者",
                "background": "テスト経歴",
                "values": ["価値観1"],
                "writing_style": {
                    "tone": "casual",
                    "target_audience": "若年層",
                    "avoid": ["専門用語"],
                },
                "unique_perspectives": ["独自視点1"],
                "category_expertise": {"tech": "技術解説"},
            }
        }

        yaml_path = tmp_path / "persona.yaml"
        yaml_path.write_text(yaml.dump(persona_data, allow_unicode=True))

        persona = load_persona(yaml_path)
        assert persona.name == "テスト著者"
        assert persona.writing_style.tone == "casual"
        assert persona.unique_perspectives == ["独自視点1"]

    def test_load_persona_file_not_found_returns_none(self, tmp_path):
        from src.agents.writer.schemas.persona import load_persona

        result = load_persona(tmp_path / "nonexistent.yaml")
        assert result is None

    def test_load_persona_default_path(self):
        """デフォルトパス（config/persona.yaml）から読み込み試行"""
        from src.agents.writer.schemas.persona import load_persona

        # デフォルトパスにファイルがなくてもNoneを返す（エラーにならない）
        result = load_persona()
        # ファイルの有無に依存せずテスト可能
        assert result is None or result.name is not None


# =============================================================================
# Persona Context Formatting Tests
# =============================================================================


class TestFormatPersonaContext:
    """format_persona_context function tests"""

    def test_format_persona_context(self):
        from src.agents.writer.schemas.persona import (
            PersonaConfig,
            WritingStyle,
            format_persona_context,
        )

        persona = PersonaConfig(
            name="テスト著者",
            background="元銀行員、40代でFIRE達成",
            values=["長期投資重視", "再現性のある方法を推奨"],
            writing_style=WritingStyle(
                tone="親しみやすいが論理的",
                target_audience="20-40代の投資初心者",
                avoid=["煽り表現", "過度な専門用語"],
            ),
            unique_perspectives=["サラリーマン視点での実践可能性"],
            category_expertise={"asset": "資産形成・投資の実践経験"},
        )

        context = format_persona_context(persona)

        assert "テスト著者" in context
        assert "元銀行員" in context
        assert "長期投資重視" in context
        assert "親しみやすいが論理的" in context
        assert "20-40代の投資初心者" in context
        assert "煽り表現" in context
        assert "サラリーマン視点" in context

    def test_format_persona_context_none_returns_empty(self):
        from src.agents.writer.schemas.persona import format_persona_context

        context = format_persona_context(None)
        assert context == ""


# =============================================================================
# Node Integration Tests (persona in prompt variables)
# =============================================================================


class TestAngleProposalNodeWithPersona:
    """AngleProposalNode with persona context"""

    def test_extract_prompt_variables_includes_persona(self):
        from src.agents.writer.nodes import AngleProposalNode
        from src.agents.writer.schemas import WriterInput
        from src.agents.writer.schemas.persona import (
            PersonaConfig,
            WritingStyle,
        )

        persona = PersonaConfig(
            name="テスト著者",
            background="テスト経歴",
            values=["価値観1"],
            writing_style=WritingStyle(
                tone="casual",
                target_audience="若年層",
                avoid=[],
            ),
            unique_perspectives=["独自視点"],
        )

        node = AngleProposalNode()
        state = {
            "input": WriterInput(topic="テスト", keywords=["kw1"]),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
            "persona": persona,
        }

        variables = node.extract_prompt_variables(state)
        assert "persona_context" in variables
        assert "テスト著者" in variables["persona_context"]

    def test_extract_prompt_variables_without_persona(self):
        from src.agents.writer.nodes import AngleProposalNode
        from src.agents.writer.schemas import WriterInput

        node = AngleProposalNode()
        state = {
            "input": WriterInput(topic="テスト", keywords=["kw1"]),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
            "persona": None,
        }

        variables = node.extract_prompt_variables(state)
        assert "persona_context" in variables
        assert variables["persona_context"] == ""


class TestPlannerNodeWithPersona:
    """PlannerNode with persona context"""

    def test_extract_prompt_variables_includes_persona(self):
        from src.agents.writer.nodes import PlannerNode
        from src.agents.writer.schemas import WriterInput
        from src.agents.writer.schemas.persona import (
            PersonaConfig,
            WritingStyle,
        )

        persona = PersonaConfig(
            name="テスト著者",
            background="テスト経歴",
            values=[],
            writing_style=WritingStyle(
                tone="professional",
                target_audience="ビジネスパーソン",
                avoid=[],
            ),
        )

        node = PlannerNode()
        state = {
            "input": WriterInput(topic="テスト", keywords=["kw1"]),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
            "persona": persona,
        }

        variables = node.extract_prompt_variables(state)
        assert "persona_context" in variables
        # ペルソナのtoneが使われる
        assert "professional" in variables["persona_context"]


class TestExecutorNodeWithPersona:
    """ExecutorNode with persona context in prompt variables"""

    def test_persona_injected_into_section_execution(self):
        from unittest.mock import MagicMock

        from src.agents.writer.nodes import ExecutorNode
        from src.agents.writer.schemas import (
            ArticlePlan,
            PlannedSection,
            Section,
            WriterInput,
        )
        from src.agents.writer.schemas.persona import (
            PersonaConfig,
            WritingStyle,
        )

        persona = PersonaConfig(
            name="テスト著者",
            background="テスト経歴",
            values=["価値観1"],
            writing_style=WritingStyle(
                tone="casual",
                target_audience="若年層",
                avoid=[],
            ),
        )

        mock_section = Section(heading="導入", level=2, content="テスト内容")

        with patch("src.core.nodes.base.BaseNode._get_model_factory") as mock_factory:
            mock_model = MagicMock()
            mock_model.invoke.return_value = mock_section
            mock_factory.return_value = lambda schema: mock_model

            node = ExecutorNode()
            state = {
                "input": WriterInput(topic="テスト", keywords=["kw1"]),
                "messages": [],
                "angle_proposals": None,
                "selected_angle": None,
                "plan": ArticlePlan(
                    title="テスト",
                    sections=[
                        PlannedSection(heading="導入", level=2, description="導入部分"),
                    ],
                ),
                "sections": [],
                "reflection": None,
                "retry_count": 0,
                "output": None,
                "persona": persona,
            }

            result = node(state)
            assert "sections" in result

            # LLMに送信されたメッセージにペルソナ情報が含まれていることを確認
            call_args = mock_model.invoke.call_args[0][0]
            user_message_content = call_args[1].content
            assert "テスト著者" in user_message_content


# =============================================================================
# WriterAgent Integration Tests
# =============================================================================


class TestWriterAgentWithPersona:
    """WriterAgent persona integration tests"""

    def test_create_initial_state_includes_persona(self, tmp_path):
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import WriterInput

        persona_data = {
            "persona": {
                "name": "テスト著者",
                "background": "テスト経歴",
                "values": [],
                "writing_style": {
                    "tone": "informative",
                    "target_audience": "一般読者",
                    "avoid": [],
                },
            }
        }

        yaml_path = tmp_path / "persona.yaml"
        yaml_path.write_text(yaml.dump(persona_data, allow_unicode=True))

        agent = WriterAgent(persona_path=yaml_path)
        input_data = WriterInput(topic="テスト", keywords=["kw1"])
        state = agent.create_initial_state(input_data)

        assert "persona" in state
        assert state["persona"] is not None
        assert state["persona"].name == "テスト著者"

    def test_create_initial_state_without_persona_file(self, tmp_path):
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import WriterInput

        agent = WriterAgent(persona_path=tmp_path / "nonexistent.yaml")
        input_data = WriterInput(topic="テスト", keywords=["kw1"])
        state = agent.create_initial_state(input_data)

        assert "persona" in state
        assert state["persona"] is None

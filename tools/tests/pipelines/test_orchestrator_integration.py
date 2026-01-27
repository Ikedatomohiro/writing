"""Integration tests for orchestrator with real agents.

Tests the orchestrator with actual agent classes using mocked run methods.
"""

from unittest.mock import MagicMock, patch

import pytest

from src.pipelines.orchestrator import (
    AgentOrchestrator,
    WorkflowStep,
)


class TestOrchestratorWithKeywordFinder:
    """KeywordFinderAgentとの統合テスト"""

    def test_orchestrator_with_keyword_finder(self):
        """KeywordFinderAgentをオーケストレーターで実行できる"""
        from src.agents.keyword_finder.schemas import (
            KeywordResult,
            KeywordSearchInput,
            KeywordSearchOutput,
        )

        # Create mock agent with run method
        mock_agent = MagicMock()
        mock_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9),
                KeywordResult(keyword="iDeCo メリット", relevance_score=0.85),
            ],
            summary="キーワードを発見しました",
        )
        mock_agent.run.return_value = mock_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("keyword_finder", mock_agent)

        # Define workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
        ]

        # Create input
        initial_context = KeywordSearchInput(
            category="資産形成",
            seed_keywords=["iDeCo"],
        )

        # Run workflow
        result = orchestrator.run_workflow(steps, initial_context=initial_context)

        assert result.success is True
        assert "keyword_finder" in result.outputs
        assert result.outputs["keyword_finder"]["category"] == "資産形成"
        assert len(result.outputs["keyword_finder"]["results"]) == 2


class TestOrchestratorWithEvaluator:
    """EvaluatorAgentとの統合テスト"""

    def test_orchestrator_with_evaluator(self):
        """EvaluatorAgentをオーケストレーターで実行できる"""
        from src.agents.evaluator.schemas import (
            CriterionScore,
            EvaluationInput,
            EvaluationOutput,
        )

        # Create mock agent
        mock_agent = MagicMock()
        mock_output = EvaluationOutput(
            target_summary="iDeCo 始め方に関する評価",
            target_type="キーワード",
            overall_score=85,
            criterion_scores=[
                CriterionScore(
                    criterion="関連性",
                    score=90,
                    rationale="キーワードに関連性が高い",
                ),
            ],
            strengths=["明確なテーマ"],
            weaknesses=[],
            improvements=["より具体的な説明"],
            evaluation_criteria=["関連性", "実用性"],
            summary="評価完了",
        )
        mock_agent.run.return_value = mock_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("evaluator", mock_agent)

        # Define workflow
        steps = [
            WorkflowStep(agent_name="evaluator"),
        ]

        # Create input
        initial_context = EvaluationInput(
            target="iDeCo 始め方",
            evaluation_request="このキーワードの評価をお願いします",
        )

        # Run workflow
        result = orchestrator.run_workflow(steps, initial_context=initial_context)

        assert result.success is True
        assert "evaluator" in result.outputs
        assert result.outputs["evaluator"]["overall_score"] == 85


class TestOrchestratorWithWriter:
    """WriterAgentとの統合テスト"""

    def test_orchestrator_with_writer(self):
        """WriterAgentをオーケストレーターで実行できる"""
        from src.agents.writer.schemas import (
            Section,
            WriterInput,
            WriterOutput,
        )

        # Create mock agent
        mock_agent = MagicMock()
        mock_output = WriterOutput(
            title="iDeCoの始め方完全ガイド",
            description="iDeCoの基本的な始め方を解説します",
            content="# iDeCoの始め方\n\niDeCoは...",
            keywords_used=["iDeCo", "始め方"],
            sections=[
                Section(
                    heading="はじめに",
                    level=2,
                    content="iDeCoは個人型確定拠出年金の略称です。",
                ),
            ],
            summary="iDeCoの始め方について解説した記事です",
        )
        mock_agent.run.return_value = mock_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("writer", mock_agent)

        # Define workflow
        steps = [
            WorkflowStep(agent_name="writer"),
        ]

        # Create input
        initial_context = WriterInput(
            topic="iDeCoの始め方",
            keywords=["iDeCo", "始め方", "資産形成"],
        )

        # Run workflow
        result = orchestrator.run_workflow(steps, initial_context=initial_context)

        assert result.success is True
        assert "writer" in result.outputs
        assert "iDeCo" in result.outputs["writer"]["title"]


class TestMultiAgentPipeline:
    """複数エージェントのパイプラインテスト"""

    def test_keyword_finder_to_evaluator_pipeline(self):
        """keyword_finder -> evaluator のパイプラインが動作する"""
        from src.agents.evaluator.schemas import (
            CriterionScore,
            EvaluationOutput,
        )
        from src.agents.keyword_finder.schemas import (
            KeywordResult,
            KeywordSearchInput,
            KeywordSearchOutput,
        )

        # Mock keyword finder
        mock_finder = MagicMock()
        finder_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9),
            ],
            summary="キーワードを発見",
        )
        mock_finder.run.return_value = finder_output

        # Mock evaluator
        mock_evaluator = MagicMock()
        evaluator_output = EvaluationOutput(
            target_summary="iDeCo 始め方の評価",
            target_type="キーワード",
            overall_score=90,
            criterion_scores=[
                CriterionScore(
                    criterion="関連性",
                    score=90,
                    rationale="良い記事",
                ),
            ],
            strengths=["良いテーマ"],
            weaknesses=[],
            improvements=[],
            evaluation_criteria=["関連性"],
            summary="評価完了",
        )
        mock_evaluator.run.return_value = evaluator_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("keyword_finder", mock_finder)
        orchestrator.register_agent("evaluator", mock_evaluator)

        # Define workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
        ]

        # Create input
        initial_context = KeywordSearchInput(
            category="資産形成",
            seed_keywords=["iDeCo"],
        )

        # Run workflow
        result = orchestrator.run_workflow(steps, initial_context=initial_context)

        assert result.success is True
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs
        # Verify both agents were called
        mock_finder.run.assert_called_once()
        mock_evaluator.run.assert_called_once()

    def test_three_agent_pipeline(self):
        """keyword_finder -> evaluator -> writer の3エージェントパイプライン"""
        from src.agents.evaluator.schemas import (
            CriterionScore,
            EvaluationOutput,
        )
        from src.agents.keyword_finder.schemas import (
            KeywordResult,
            KeywordSearchInput,
            KeywordSearchOutput,
        )
        from src.agents.writer.schemas import (
            Section,
            WriterOutput,
        )

        # Mock all agents
        mock_finder = MagicMock()
        mock_finder.run.return_value = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9)],
            summary="キーワード発見",
        )

        mock_evaluator = MagicMock()
        mock_evaluator.run.return_value = EvaluationOutput(
            target_summary="評価完了",
            target_type="キーワード",
            overall_score=85,
            criterion_scores=[
                CriterionScore(criterion="関連性", score=85, rationale="良い")
            ],
            strengths=["良いテーマ"],
            weaknesses=[],
            improvements=[],
            evaluation_criteria=["関連性"],
            summary="評価OK",
        )

        mock_writer = MagicMock()
        mock_writer.run.return_value = WriterOutput(
            title="iDeCoガイド",
            description="iDeCoガイドの説明",
            content="# iDeCoガイド\n\n内容",
            keywords_used=["iDeCo"],
            sections=[Section(heading="はじめに", level=2, content="内容")],
            summary="記事作成完了",
        )

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("keyword_finder", mock_finder)
        orchestrator.register_agent("evaluator", mock_evaluator)
        orchestrator.register_agent("writer", mock_writer)

        # Define workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
            WorkflowStep(agent_name="writer"),
        ]

        # Run workflow
        result = orchestrator.run_workflow(
            steps,
            initial_context=KeywordSearchInput(
                category="資産形成", seed_keywords=["iDeCo"]
            ),
        )

        assert result.success is True
        assert len(result.outputs) == 3
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs
        assert "writer" in result.outputs


class TestWorkflowContextFlow:
    """ワークフローのコンテキストフローテスト"""

    def test_context_accumulates_through_workflow(self):
        """ワークフローを通じてコンテキストが蓄積される"""
        orchestrator = AgentOrchestrator()

        # Create mock agents
        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"step1_data": "value1"}
        agent1.run.return_value = output1

        agent2 = MagicMock()
        output2 = MagicMock()
        output2.model_dump.return_value = {"step2_data": "value2"}
        agent2.run.return_value = output2

        agent3 = MagicMock()
        output3 = MagicMock()
        output3.model_dump.return_value = {"step3_data": "value3"}
        agent3.run.return_value = output3

        orchestrator.register_agent("step1", agent1)
        orchestrator.register_agent("step2", agent2)
        orchestrator.register_agent("step3", agent3)

        steps = [
            WorkflowStep(agent_name="step1"),
            WorkflowStep(agent_name="step2"),
            WorkflowStep(agent_name="step3"),
        ]

        result = orchestrator.run_workflow(
            steps, initial_context={"initial": "context"}
        )

        # All outputs should be in context
        assert result.context["initial"] == "context"
        assert result.context["step1"]["step1_data"] == "value1"
        assert result.context["step2"]["step2_data"] == "value2"
        assert result.context["step3"]["step3_data"] == "value3"

    def test_later_steps_can_access_earlier_outputs(self):
        """後のステップが前のステップの出力にアクセスできる"""
        orchestrator = AgentOrchestrator()

        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"keywords": ["k1", "k2"]}
        agent1.run.return_value = output1

        agent2 = MagicMock()
        output2 = MagicMock()
        output2.model_dump.return_value = {"processed": True}
        agent2.run.return_value = output2

        orchestrator.register_agent("finder", agent1)
        orchestrator.register_agent("processor", agent2)

        steps = [
            WorkflowStep(agent_name="finder"),
            WorkflowStep(
                agent_name="processor",
                input_mapping={"keywords": "finder.keywords"},
            ),
        ]

        result = orchestrator.run_workflow(steps, initial_context={})

        # Verify processor received the keywords
        processor_call_args = agent2.run.call_args
        assert processor_call_args is not None
        input_received = processor_call_args[0][0]
        assert input_received.get("keywords") == ["k1", "k2"]


class TestRealWorldScenarios:
    """実際のユースケースシナリオテスト"""

    def test_content_creation_workflow(self):
        """コンテンツ作成ワークフロー（キーワード調査→評価→記事作成）"""
        from src.agents.evaluator.schemas import (
            CriterionScore,
            EvaluationOutput,
        )
        from src.agents.keyword_finder.schemas import (
            KeywordResult,
            KeywordSearchOutput,
        )
        from src.agents.writer.schemas import (
            Section,
            WriterOutput,
        )

        orchestrator = AgentOrchestrator()

        # Step 1: Keyword Finder
        finder = MagicMock()
        finder.run.return_value = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["投資信託"],
            results=[
                KeywordResult(keyword="投資信託 初心者", relevance_score=0.95),
                KeywordResult(keyword="投資信託 おすすめ", relevance_score=0.88),
            ],
            summary="2つのキーワードを発見",
        )
        orchestrator.register_agent("keyword_finder", finder)

        # Step 2: Evaluator
        evaluator = MagicMock()
        evaluator.run.return_value = EvaluationOutput(
            target_summary="投資信託キーワードの評価",
            target_type="キーワードリスト",
            overall_score=92,
            criterion_scores=[
                CriterionScore(criterion="検索ボリューム", score=90, rationale="高い"),
                CriterionScore(criterion="競合度", score=85, rationale="中程度"),
            ],
            strengths=["需要が高い", "初心者向け"],
            weaknesses=["競合が多い"],
            improvements=["独自の視点を追加"],
            evaluation_criteria=["検索ボリューム", "競合度"],
            summary="高品質なキーワード",
        )
        orchestrator.register_agent("evaluator", evaluator)

        # Step 3: Writer
        writer = MagicMock()
        writer.run.return_value = WriterOutput(
            title="【初心者向け】投資信託の始め方完全ガイド",
            description="投資信託初心者向けの完全ガイド",
            content="# 投資信託の始め方\n\n投資信託とは...",
            keywords_used=["投資信託", "初心者"],
            sections=[
                Section(heading="はじめに", level=2, content="投資信託とは..."),
                Section(heading="選び方", level=2, content="投資信託の選び方..."),
                Section(heading="まとめ", level=2, content="まとめると..."),
            ],
            summary="初心者向け投資信託ガイドを作成",
        )
        orchestrator.register_agent("writer", writer)

        # Execute workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
            WorkflowStep(agent_name="writer"),
        ]

        result = orchestrator.run_workflow(
            steps, initial_context={"category": "資産形成", "topic": "投資信託"}
        )

        # Verify complete workflow execution
        assert result.success is True
        assert result.execution_time >= 0

        # Verify all outputs present
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs
        assert "writer" in result.outputs

        # Verify context accumulated
        assert result.context["keyword_finder"]["category"] == "資産形成"
        assert result.context["evaluator"]["overall_score"] == 92
        assert "投資信託" in result.context["writer"]["title"]

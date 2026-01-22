"""評価エージェントのテスト"""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.evaluator.agent import (
    create_executor_node,
    create_goal_creator_node,
    create_integrator_node,
    create_planner_node,
    create_reflector_node,
    run_evaluator,
    should_continue,
)
from src.agents.evaluator.schemas import (
    AgentState,
    CriterionScore,
    EvaluationGoal,
    EvaluationInput,
    EvaluationOutput,
    EvaluationPlan,
    EvaluationResult,
    GoalCreatorOutput,
    ReflectionResult,
)


class TestEvaluationInput:
    """EvaluationInputのテスト"""

    def test_valid_input(self):
        """有効な入力でインスタンスを作成できる"""
        input_data = EvaluationInput(
            target="これはサンプル記事です。",
            target_type="article",
            evaluation_request="SEOの観点から評価してください。",
        )
        assert input_data.target == "これはサンプル記事です。"
        assert input_data.target_type == "article"
        assert input_data.evaluation_request == "SEOの観点から評価してください。"

    def test_default_target_type(self):
        """target_typeのデフォルト値がarticleである"""
        input_data = EvaluationInput(
            target="テスト",
            evaluation_request="評価してください",
        )
        assert input_data.target_type == "article"

    def test_optional_context(self):
        """contextはオプションである"""
        input_data = EvaluationInput(
            target="テスト",
            evaluation_request="評価してください",
            context="追加情報",
        )
        assert input_data.context == "追加情報"

    def test_invalid_target_type(self):
        """無効なtarget_typeでエラーが発生する"""
        with pytest.raises(ValueError):
            EvaluationInput(
                target="テスト",
                target_type="invalid",
                evaluation_request="評価してください",
            )


class TestCriterionScore:
    """CriterionScoreのテスト"""

    def test_valid_score(self):
        """有効なスコアでインスタンスを作成できる"""
        score = CriterionScore(
            criterion="正確性",
            score=85,
            rationale="情報が正確で信頼できる",
        )
        assert score.criterion == "正確性"
        assert score.score == 85
        assert score.rationale == "情報が正確で信頼できる"

    def test_score_range(self):
        """スコアは0-100の範囲でなければならない"""
        with pytest.raises(ValueError):
            CriterionScore(
                criterion="テスト",
                score=101,
                rationale="テスト",
            )
        with pytest.raises(ValueError):
            CriterionScore(
                criterion="テスト",
                score=-1,
                rationale="テスト",
            )


class TestEvaluationOutput:
    """EvaluationOutputのテスト"""

    def test_valid_output(self):
        """有効な出力でインスタンスを作成できる"""
        output = EvaluationOutput(
            target_summary="サンプル記事の要約",
            target_type="article",
            overall_score=75,
            criterion_scores=[
                CriterionScore(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                )
            ],
            strengths=["構成が良い"],
            weaknesses=["画像が少ない"],
            improvements=["画像を追加する"],
            evaluation_criteria=["正確性"],
            summary="全体的に良い記事です。",
        )
        assert output.overall_score == 75
        assert len(output.criterion_scores) == 1
        assert len(output.strengths) == 1

    def test_overall_score_range(self):
        """overall_scoreは0-100の範囲でなければならない"""
        with pytest.raises(ValueError):
            EvaluationOutput(
                target_summary="テスト",
                target_type="article",
                overall_score=150,
                summary="テスト",
            )


class TestGoalCreatorOutput:
    """GoalCreatorOutputのテスト"""

    def test_valid_output(self):
        """有効な出力でインスタンスを作成できる"""
        output = GoalCreatorOutput(
            evaluation_goal="記事のSEO最適化を評価する",
            evaluation_criteria=["正確性", "読みやすさ"],
            questions=[],
            needs_clarification=False,
        )
        assert output.evaluation_goal == "記事のSEO最適化を評価する"
        assert len(output.evaluation_criteria) == 2
        assert output.needs_clarification is False


class TestShouldContinue:
    """should_continue のテスト"""

    def test_returns_integrate_when_sufficient(self):
        """十分な結果がある場合はintegrateを返す"""
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト", evaluation_request="評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": ReflectionResult(
                is_sufficient=True,
                feedback="評価が十分です",
                missing_criteria=[],
                additional_research=[],
            ),
            "retry_count": 1,
            "output": None,
        }
        assert should_continue(state) == "integrate"

    def test_returns_integrate_when_max_retry_reached(self):
        """最大リトライ回数に達した場合はintegrateを返す"""
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト", evaluation_request="評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="評価が不十分",
                missing_criteria=["正確性"],
                additional_research=[],
            ),
            "retry_count": 5,
            "output": None,
        }
        assert should_continue(state) == "integrate"

    def test_returns_execute_when_not_sufficient(self):
        """結果が不十分な場合はexecuteを返す"""
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト", evaluation_request="評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="評価が不十分",
                missing_criteria=["正確性"],
                additional_research=[],
            ),
            "retry_count": 1,
            "output": None,
        }
        assert should_continue(state) == "execute"

    def test_returns_execute_when_no_reflection(self):
        """reflectionがない場合はexecuteを返す"""
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト", evaluation_request="評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }
        assert should_continue(state) == "execute"


class TestCreateGoalCreatorNode:
    """create_goal_creator_node のテスト"""

    @patch("src.agents.evaluator.agent.get_structured_model")
    def test_goal_creator_creates_goal(self, mock_get_model):
        mock_goal_output = GoalCreatorOutput(
            evaluation_goal="記事の品質を評価する",
            evaluation_criteria=["正確性", "読みやすさ"],
            questions=[],
            needs_clarification=False,
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_goal_output
        mock_get_model.return_value = mock_model

        goal_creator = create_goal_creator_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = goal_creator(state)

        assert result["goal_output"] == mock_goal_output
        assert result["goal"].goal == "記事の品質を評価する"
        assert "messages" in result


class TestCreatePlannerNode:
    """create_planner_node のテスト"""

    @patch("src.agents.evaluator.agent.get_structured_model")
    def test_planner_creates_plan(self, mock_get_model):
        mock_plan = EvaluationPlan(
            steps=["正確性を評価", "読みやすさを評価"],
            required_research=["記事評価のベストプラクティス"],
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_plan
        mock_get_model.return_value = mock_model

        planner = create_planner_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": EvaluationGoal(
                goal="記事の品質を評価する",
                criteria=["正確性", "読みやすさ"],
                target_type="article",
            ),
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = planner(state)

        assert result["plan"] == mock_plan

    def test_planner_returns_empty_when_no_goal(self):
        planner = create_planner_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = planner(state)

        assert result == {}


class TestCreateExecutorNode:
    """create_executor_node のテスト"""

    def test_executor_returns_empty_when_no_plan(self):
        executor = create_executor_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = executor(state)

        assert result == {}


class TestCreateReflectorNode:
    """create_reflector_node のテスト"""

    def test_reflector_sufficient_when_all_criteria_evaluated(self):
        """すべての評価基準が評価されている場合、十分と判定する"""
        reflector = create_reflector_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": EvaluationGoal(
                goal="記事の品質を評価する",
                criteria=["正確性"],
                target_type="article",
            ),
            "plan": None,
            "tool_results": [],
            "evaluation_results": [
                EvaluationResult(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                    evidence=[],
                )
            ],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = reflector(state)

        assert result["reflection"].is_sufficient is True
        assert result["retry_count"] == 1

    @patch("src.agents.evaluator.agent.get_structured_model")
    def test_reflector_calls_llm_when_criteria_missing(self, mock_get_model):
        """未評価の基準がある場合、LLMに判定を委ねる"""
        mock_reflection = ReflectionResult(
            is_sufficient=False,
            feedback="正確性の評価が不足しています",
            missing_criteria=["正確性"],
            additional_research=[],
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_reflection
        mock_get_model.return_value = mock_model

        reflector = create_reflector_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": EvaluationGoal(
                goal="記事の品質を評価する",
                criteria=["正確性", "読みやすさ"],  # 2つの基準
                target_type="article",
            ),
            "plan": None,
            "tool_results": [],
            "evaluation_results": [
                EvaluationResult(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                    evidence=[],
                )
                # 読みやすさが未評価
            ],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = reflector(state)

        assert result["reflection"] == mock_reflection
        assert result["retry_count"] == 1
        mock_model.invoke.assert_called_once()

    def test_reflector_returns_empty_when_no_goal(self):
        reflector = create_reflector_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = reflector(state)

        assert result == {}


class TestCreateIntegratorNode:
    """create_integrator_node のテスト"""

    @patch("src.agents.evaluator.agent.get_structured_model")
    def test_integrator_creates_output(self, mock_get_model):
        mock_output = EvaluationOutput(
            target_summary="テスト記事の要約",
            target_type="article",
            overall_score=75,
            criterion_scores=[
                CriterionScore(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                )
            ],
            strengths=["構成が良い"],
            weaknesses=["画像が少ない"],
            improvements=["画像を追加する"],
            evaluation_criteria=["正確性"],
            summary="全体的に良い記事です。",
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_output
        mock_get_model.return_value = mock_model

        integrator = create_integrator_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": EvaluationGoal(
                goal="記事の品質を評価する",
                criteria=["正確性"],
                target_type="article",
            ),
            "plan": None,
            "tool_results": [],
            "evaluation_results": [
                EvaluationResult(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                    evidence=[],
                )
            ],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = integrator(state)

        assert result["output"] == mock_output

    def test_integrator_returns_empty_when_no_goal(self):
        integrator = create_integrator_node()
        state: AgentState = {
            "input": EvaluationInput(
                target="テスト記事", evaluation_request="品質を評価してください"
            ),
            "messages": [],
            "goal_output": None,
            "goal": None,
            "plan": None,
            "tool_results": [],
            "evaluation_results": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = integrator(state)

        assert result == {}


class TestRunEvaluator:
    """run_evaluator のテスト"""

    @patch("src.agents.evaluator.agent.create_evaluator_graph")
    def test_returns_output_on_success(self, mock_create_graph):
        expected_output = EvaluationOutput(
            target_summary="テスト記事の要約",
            target_type="article",
            overall_score=75,
            criterion_scores=[
                CriterionScore(
                    criterion="正確性",
                    score=80,
                    rationale="情報が正確",
                )
            ],
            strengths=["構成が良い"],
            weaknesses=["画像が少ない"],
            improvements=["画像を追加する"],
            evaluation_criteria=["正確性"],
            summary="全体的に良い記事です。",
        )

        mock_graph = MagicMock()
        mock_graph.invoke.return_value = {"output": expected_output}
        mock_create_graph.return_value = mock_graph

        input_data = EvaluationInput(
            target="テスト記事", evaluation_request="品質を評価してください"
        )
        result = run_evaluator(input_data)

        assert result == expected_output

    @patch("src.agents.evaluator.agent.create_evaluator_graph")
    def test_returns_fallback_on_no_output(self, mock_create_graph):
        mock_graph = MagicMock()
        mock_graph.invoke.return_value = {"output": None}
        mock_create_graph.return_value = mock_graph

        input_data = EvaluationInput(
            target="テスト記事", evaluation_request="品質を評価してください"
        )
        result = run_evaluator(input_data)

        assert result.target_type == "article"
        assert result.overall_score == 0
        assert "失敗" in result.summary

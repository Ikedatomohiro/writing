"""Tests for core schemas."""

import pytest
from pydantic import ValidationError

from src.core.schemas import BaseReflection, BasePlan, BaseToolResult


class TestBaseReflection:
    """BaseReflection schema tests."""

    def test_valid_reflection(self):
        """Valid reflection with all fields."""
        reflection = BaseReflection(
            is_sufficient=True,
            feedback="All criteria evaluated successfully.",
        )
        assert reflection.is_sufficient is True
        assert reflection.feedback == "All criteria evaluated successfully."

    def test_insufficient_reflection(self):
        """Reflection indicating insufficient results."""
        reflection = BaseReflection(
            is_sufficient=False,
            feedback="Need more information about criterion X.",
        )
        assert reflection.is_sufficient is False
        assert "more information" in reflection.feedback

    def test_missing_is_sufficient_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BaseReflection(feedback="Some feedback")

    def test_missing_feedback_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BaseReflection(is_sufficient=True)


class TestBaseToolResult:
    """BaseToolResult schema tests."""

    def test_valid_tool_result(self):
        """Valid tool result with all fields."""
        result = BaseToolResult(
            tool_name="search_web",
            query="Python best practices",
            results=["result1", "result2"],
        )
        assert result.tool_name == "search_web"
        assert result.query == "Python best practices"
        assert len(result.results) == 2

    def test_empty_results(self):
        """Tool result with empty results list."""
        result = BaseToolResult(
            tool_name="search_web",
            query="obscure query",
            results=[],
        )
        assert result.results == []

    def test_missing_tool_name_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BaseToolResult(query="test", results=[])

    def test_missing_query_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BaseToolResult(tool_name="test", results=[])

    def test_missing_results_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BaseToolResult(tool_name="test", query="test")


class TestBasePlan:
    """BasePlan schema tests."""

    def test_valid_plan(self):
        """Valid plan with steps."""
        plan = BasePlan(
            steps=["Step 1: Research", "Step 2: Implement", "Step 3: Test"],
        )
        assert len(plan.steps) == 3
        assert "Research" in plan.steps[0]

    def test_empty_steps(self):
        """Plan with empty steps list."""
        plan = BasePlan(steps=[])
        assert plan.steps == []

    def test_missing_steps_raises_error(self):
        """Missing required field raises error."""
        with pytest.raises(ValidationError):
            BasePlan()


class TestSchemaInheritance:
    """Test that base schemas can be inherited."""

    def test_reflection_inheritance(self):
        """BaseReflection can be inherited."""

        class ExtendedReflection(BaseReflection):
            missing_criteria: list[str] = []

        reflection = ExtendedReflection(
            is_sufficient=False,
            feedback="Missing some criteria",
            missing_criteria=["criterion1", "criterion2"],
        )
        assert reflection.is_sufficient is False
        assert len(reflection.missing_criteria) == 2

    def test_tool_result_inheritance(self):
        """BaseToolResult can be inherited."""

        class SearchToolResult(BaseToolResult):
            source: str = "web"

        result = SearchToolResult(
            tool_name="search_web",
            query="test",
            results=["r1"],
            source="google",
        )
        assert result.source == "google"

    def test_plan_inheritance(self):
        """BasePlan can be inherited."""

        class DetailedPlan(BasePlan):
            required_research: list[str] = []

        plan = DetailedPlan(
            steps=["Step 1"],
            required_research=["Research topic A"],
        )
        assert len(plan.required_research) == 1

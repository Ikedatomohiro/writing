"""Tests for retry utilities."""

from src.core.schemas import BaseReflection
from src.core.utils.retry import RetryConfig, create_should_continue


class TestRetryConfig:
    """RetryConfig tests."""

    def test_default_values(self):
        """Default values are set correctly."""
        config = RetryConfig()
        assert config.max_retries == 5
        assert config.continue_node == "execute"
        assert config.finish_node == "integrate"

    def test_custom_values(self):
        """Custom values can be set."""
        config = RetryConfig(
            max_retries=10,
            continue_node="retry",
            finish_node="complete",
        )
        assert config.max_retries == 10
        assert config.continue_node == "retry"
        assert config.finish_node == "complete"

    def test_zero_max_retries(self):
        """Zero max_retries is allowed."""
        config = RetryConfig(max_retries=0)
        assert config.max_retries == 0


class TestCreateShouldContinue:
    """Tests for create_should_continue factory function."""

    def test_returns_finish_when_reflection_is_sufficient(self):
        """Returns finish_node when reflection.is_sufficient is True."""
        config = RetryConfig(
            max_retries=5,
            continue_node="execute",
            finish_node="integrate",
        )
        should_continue = create_should_continue(config)

        reflection = BaseReflection(is_sufficient=True, feedback="Good enough")
        state = {"reflection": reflection, "retry_count": 1}

        result = should_continue(state)
        assert result == "integrate"

    def test_returns_finish_when_max_retries_reached(self):
        """Returns finish_node when max retries reached."""
        config = RetryConfig(
            max_retries=3,
            continue_node="execute",
            finish_node="integrate",
        )
        should_continue = create_should_continue(config)

        reflection = BaseReflection(is_sufficient=False, feedback="Need more")
        state = {"reflection": reflection, "retry_count": 3}

        result = should_continue(state)
        assert result == "integrate"

    def test_returns_continue_when_not_sufficient(self):
        """Returns continue_node when reflection is not sufficient."""
        config = RetryConfig(
            max_retries=5,
            continue_node="execute",
            finish_node="integrate",
        )
        should_continue = create_should_continue(config)

        reflection = BaseReflection(is_sufficient=False, feedback="Need more work")
        state = {"reflection": reflection, "retry_count": 2}

        result = should_continue(state)
        assert result == "execute"

    def test_returns_continue_when_no_reflection(self):
        """Returns continue_node when no reflection in state."""
        config = RetryConfig(
            max_retries=5,
            continue_node="execute",
            finish_node="integrate",
        )
        should_continue = create_should_continue(config)

        state = {"retry_count": 0}

        result = should_continue(state)
        assert result == "execute"

    def test_returns_continue_when_reflection_is_none(self):
        """Returns continue_node when reflection is None."""
        config = RetryConfig(
            max_retries=5,
            continue_node="execute",
            finish_node="integrate",
        )
        should_continue = create_should_continue(config)

        state = {"reflection": None, "retry_count": 0}

        result = should_continue(state)
        assert result == "execute"

    def test_custom_node_names(self):
        """Works with custom node names."""
        config = RetryConfig(
            max_retries=2,
            continue_node="retry_execute",
            finish_node="finalize",
        )
        should_continue = create_should_continue(config)

        # Test finish
        reflection = BaseReflection(is_sufficient=True, feedback="Done")
        state = {"reflection": reflection, "retry_count": 1}
        assert should_continue(state) == "finalize"

        # Test continue
        reflection = BaseReflection(is_sufficient=False, feedback="More")
        state = {"reflection": reflection, "retry_count": 1}
        assert should_continue(state) == "retry_execute"

    def test_retry_count_defaults_to_zero(self):
        """retry_count defaults to 0 if not in state."""
        config = RetryConfig(max_retries=5)
        should_continue = create_should_continue(config)

        reflection = BaseReflection(is_sufficient=False, feedback="More")
        state = {"reflection": reflection}

        result = should_continue(state)
        assert result == "execute"

    def test_zero_max_retries_always_finishes_after_first(self):
        """With max_retries=0, finishes after first reflection."""
        config = RetryConfig(max_retries=0)
        should_continue = create_should_continue(config)

        reflection = BaseReflection(is_sufficient=False, feedback="More")
        state = {"reflection": reflection, "retry_count": 0}

        result = should_continue(state)
        assert result == "integrate"


class TestShouldContinueWithExtendedReflection:
    """Test should_continue with extended reflection classes."""

    def test_works_with_extended_reflection(self):
        """Works with classes that extend BaseReflection."""

        class ExtendedReflection(BaseReflection):
            missing_items: list[str] = []

        config = RetryConfig()
        should_continue = create_should_continue(config)

        reflection = ExtendedReflection(
            is_sufficient=True,
            feedback="All done",
            missing_items=[],
        )
        state = {"reflection": reflection, "retry_count": 1}

        result = should_continue(state)
        assert result == "integrate"

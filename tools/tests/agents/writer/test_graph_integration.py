"""Tests for writer agent graph integration with image suggestion node."""

from src.agents.writer.agent import WriterAgent


class TestWriterAgentGraphIntegration:
    """WriterAgent graph with ImageSuggestionNode."""

    def test_create_nodes_includes_image_suggest(self):
        agent = WriterAgent()
        nodes = agent.create_nodes()
        assert "image_suggest" in nodes

    def test_graph_builds_successfully(self):
        agent = WriterAgent()
        graph = agent.build_graph()
        assert graph is not None

    def test_initial_state_has_image_suggestions(self):
        from src.agents.writer.schemas.input import WriterInput

        agent = WriterAgent()
        input_data = WriterInput(
            topic="テスト",
            keywords=["テスト"],
        )
        state = agent.create_initial_state(input_data)
        assert "image_suggestions" in state
        assert state["image_suggestions"] is None

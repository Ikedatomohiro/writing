"""Orchestrator implementation.

複数のエージェントを連携させてワークフローを実行するオーケストレーター。
"""

from typing import Any

from src.common import get_logger
from src.core.agents import BaseAgent
from src.core.orchestrator.schemas import (
    ExecutionContext,
    InputMapper,
    OrchestratorConfig,
    WorkflowDefinition,
    WorkflowStep,
)

logger = get_logger(__name__)


class OrchestratorError(Exception):
    """オーケストレーター関連のエラー."""

    pass


class AgentNotFoundError(OrchestratorError):
    """エージェントが見つからない場合のエラー."""

    pass


class WorkflowNotFoundError(OrchestratorError):
    """ワークフローが見つからない場合のエラー."""

    pass


class Orchestrator:
    """エージェントオーケストレーター.

    複数のエージェントを登録し、定義されたワークフローに従って
    順次実行する。

    Example:
        >>> orchestrator = Orchestrator()
        >>> orchestrator.register_agent("keyword_finder", KeywordFinderAgent())
        >>> orchestrator.register_agent("writer", WriterAgent())
        >>>
        >>> workflow = WorkflowDefinition(
        ...     name="article_generation",
        ...     steps=[
        ...         WorkflowStep(agent_name="keyword_finder", output_key="keywords"),
        ...         WorkflowStep(agent_name="writer", output_key="article"),
        ...     ]
        ... )
        >>> orchestrator.register_workflow(workflow)
        >>>
        >>> result = orchestrator.run_workflow("article_generation", initial_input)
    """

    def __init__(self, config: OrchestratorConfig | None = None):
        """オーケストレーターを初期化.

        Args:
            config: オーケストレーター設定（省略時はデフォルト設定）
        """
        self._config = config or OrchestratorConfig()
        self._agents: dict[str, BaseAgent] = {}
        self._input_mappers: dict[str, InputMapper] = {}

    @property
    def agents(self) -> dict[str, BaseAgent]:
        """登録されているエージェント."""
        return self._agents.copy()

    @property
    def workflows(self) -> dict[str, WorkflowDefinition]:
        """登録されているワークフロー."""
        return self._config.workflows.copy()

    def register_agent(self, name: str, agent: BaseAgent) -> None:
        """エージェントを登録.

        Args:
            name: エージェント名
            agent: エージェントインスタンス
        """
        self._agents[name] = agent
        logger.info(f"エージェント登録: {name}")

    def register_input_mapper(self, name: str, mapper: InputMapper) -> None:
        """入力マッパーを登録.

        Args:
            name: マッパー名
            mapper: マッパー関数
        """
        self._input_mappers[name] = mapper
        logger.debug(f"入力マッパー登録: {name}")

    def register_workflow(self, workflow: WorkflowDefinition) -> None:
        """ワークフローを登録.

        Args:
            workflow: ワークフロー定義
        """
        self._config.workflows[workflow.name] = workflow
        logger.info(f"ワークフロー登録: {workflow.name}")

    def run_workflow(
        self,
        workflow_name: str | None = None,
        initial_input: Any = None,
        context: ExecutionContext | None = None,
    ) -> ExecutionContext:
        """ワークフローを実行.

        Args:
            workflow_name: 実行するワークフロー名（省略時はデフォルト）
            initial_input: 初期入力データ
            context: 既存のコンテキスト（省略時は新規作成）

        Returns:
            実行結果を含むコンテキスト

        Raises:
            WorkflowNotFoundError: ワークフローが見つからない場合
            AgentNotFoundError: エージェントが見つからない場合
        """
        # ワークフロー名の解決
        name = workflow_name or self._config.default_workflow
        if not name:
            raise WorkflowNotFoundError("ワークフロー名が指定されていません")

        workflow = self._config.workflows.get(name)
        if not workflow:
            raise WorkflowNotFoundError(f"ワークフロー '{name}' が見つかりません")

        # コンテキストの初期化
        ctx = context or ExecutionContext()
        if initial_input is not None:
            ctx.set("initial_input", initial_input)

        logger.info(f"ワークフロー開始: {name}")

        # 各ステップを実行
        for i, step in enumerate(workflow.steps):
            logger.info(f"ステップ {i + 1}/{len(workflow.steps)}: {step.agent_name}")
            ctx = self._execute_step(step, ctx)

        logger.info(f"ワークフロー完了: {name}")
        return ctx

    def _execute_step(
        self, step: WorkflowStep, context: ExecutionContext
    ) -> ExecutionContext:
        """ワークフローの1ステップを実行.

        Args:
            step: 実行するステップ
            context: 現在のコンテキスト

        Returns:
            更新されたコンテキスト

        Raises:
            AgentNotFoundError: エージェントが見つからない場合
        """
        agent = self._agents.get(step.agent_name)
        if not agent:
            raise AgentNotFoundError(f"エージェント '{step.agent_name}' が見つかりません")

        # 入力の準備
        agent_input = self._prepare_input(step, context)

        # エージェント実行
        logger.debug(f"エージェント実行: {step.agent_name}")
        result = agent.run(agent_input)

        # 結果をコンテキストに格納
        context.set(step.output_key, result)
        logger.debug(f"結果格納: {step.output_key}")

        return context

    def _prepare_input(self, step: WorkflowStep, context: ExecutionContext) -> Any:
        """ステップの入力を準備.

        Args:
            step: 実行するステップ
            context: 現在のコンテキスト

        Returns:
            エージェントへの入力
        """
        if step.input_mapper:
            mapper = self._input_mappers.get(step.input_mapper)
            if mapper:
                return mapper(context)
            logger.warning(f"入力マッパー '{step.input_mapper}' が見つかりません")

        # デフォルト: initial_inputを使用
        return context.get("initial_input")

    def _merge_context(
        self, context: ExecutionContext, result: Any, output_key: str
    ) -> ExecutionContext:
        """結果をコンテキストにマージ.

        Args:
            context: 現在のコンテキスト
            result: エージェントの実行結果
            output_key: 結果を格納するキー

        Returns:
            更新されたコンテキスト
        """
        return context.merge({output_key: result})

"""Orchestrator schemas.

オーケストレーターの設定とコンテキスト管理のためのスキーマ定義。
"""

from typing import Any, Callable

from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    """ワークフローの1ステップを定義.

    Attributes:
        agent_name: 実行するエージェントの名前
        input_mapper: 前のコンテキストからエージェント入力への変換関数名
        output_key: 結果を格納するコンテキストキー
    """

    agent_name: str = Field(..., description="実行するエージェントの名前")
    input_mapper: str | None = Field(
        None, description="入力マッパー関数名（Noneの場合はコンテキスト全体を渡す）"
    )
    output_key: str = Field(..., description="結果を格納するコンテキストキー")


class WorkflowDefinition(BaseModel):
    """ワークフロー全体の定義.

    Attributes:
        name: ワークフロー名
        description: ワークフローの説明
        steps: 実行ステップのリスト
    """

    name: str = Field(..., description="ワークフロー名")
    description: str = Field("", description="ワークフローの説明")
    steps: list[WorkflowStep] = Field(default_factory=list, description="実行ステップ")


class ExecutionContext(BaseModel):
    """ワークフロー実行中のコンテキスト.

    エージェント間でデータを受け渡すためのコンテナ。

    Attributes:
        data: コンテキストデータ（キー: 値のマッピング）
        metadata: メタデータ（実行情報など）
    """

    data: dict[str, Any] = Field(default_factory=dict, description="コンテキストデータ")
    metadata: dict[str, Any] = Field(default_factory=dict, description="メタデータ")

    def get(self, key: str, default: Any = None) -> Any:
        """コンテキストからデータを取得."""
        return self.data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """コンテキストにデータを設定."""
        self.data[key] = value

    def merge(self, other: dict[str, Any]) -> "ExecutionContext":
        """他のデータをマージした新しいコンテキストを返す."""
        new_data = {**self.data, **other}
        return ExecutionContext(data=new_data, metadata=self.metadata)


class OrchestratorConfig(BaseModel):
    """オーケストレーターの設定.

    Attributes:
        name: オーケストレーター名
        workflows: 利用可能なワークフロー定義
        default_workflow: デフォルトで使用するワークフロー名
    """

    name: str = Field("default", description="オーケストレーター名")
    workflows: dict[str, WorkflowDefinition] = Field(
        default_factory=dict, description="ワークフロー定義"
    )
    default_workflow: str | None = Field(None, description="デフォルトワークフロー名")


# 入力マッパーの型定義
InputMapper = Callable[[ExecutionContext], Any]

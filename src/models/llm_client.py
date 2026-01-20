"""LLMクライアント抽象化モジュール"""

from langchain_openai import ChatOpenAI

from src.common import get_logger, settings

logger = get_logger(__name__)


def get_chat_model(
    model: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> ChatOpenAI:
    """ChatOpenAIインスタンスを取得する

    Args:
        model: モデル名（デフォルト: settings.default_model）
        temperature: 温度パラメータ
        max_tokens: 最大トークン数

    Returns:
        ChatOpenAIインスタンス
    """
    model = model or settings.default_model
    temperature = temperature if temperature is not None else settings.temperature
    max_tokens = max_tokens or settings.max_tokens

    logger.debug(f"Creating ChatOpenAI: model={model}, temp={temperature}")

    return ChatOpenAI(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=settings.openai_api_key,
    )


def get_structured_model(
    schema: type,
    model: str | None = None,
    temperature: float | None = None,
) -> ChatOpenAI:
    """構造化出力用のモデルを取得する

    Args:
        schema: 出力スキーマ（Pydanticモデル）
        model: モデル名
        temperature: 温度パラメータ

    Returns:
        構造化出力設定済みのChatOpenAIインスタンス
    """
    chat_model = get_chat_model(model=model, temperature=temperature)
    return chat_model.with_structured_output(schema)

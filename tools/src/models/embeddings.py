"""埋め込みモデルモジュール"""

from langchain_openai import OpenAIEmbeddings

from src.common import get_logger, settings

logger = get_logger(__name__)


def get_embeddings(model: str = "text-embedding-3-small") -> OpenAIEmbeddings:
    """OpenAI Embeddingsインスタンスを取得する

    Args:
        model: 埋め込みモデル名

    Returns:
        OpenAIEmbeddingsインスタンス
    """
    logger.debug(f"Creating OpenAIEmbeddings: model={model}")

    return OpenAIEmbeddings(
        model=model,
        api_key=settings.openai_api_key,
    )

"""ロギング設定モジュール"""

import logging
import sys
from typing import Literal


def get_logger(
    name: str,
    level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO",
) -> logging.Logger:
    """ロガーを取得する

    Args:
        name: ロガー名
        level: ログレベル

    Returns:
        設定済みのロガー
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(getattr(logging, level))
    return logger

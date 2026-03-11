import logging
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings


def setup_logging():
    """Setup logging configuration for the backend."""
    # Determine the log level
    log_level = logging.DEBUG if settings.DEBUG else getattr(
        logging, settings.LOG_LEVEL.upper(), logging.INFO
    )

    # Define the format for log entries
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    formatter = logging.Formatter(log_format)

    # 1. Console Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # 2. Rotating File Handler (persistent)
    file_handler = RotatingFileHandler(
        settings.LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)

    # Configure the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear any existing handlers to avoid duplicate logs (e.g., when reloading)
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    # Add both handlers to the root logger
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    # Redirect specific loggers to our handler set
    # This ensures uvicorn and sqlalchemy output also goes to the file
    for logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access", "sqlalchemy.engine", "app"]:
        logger = logging.getLogger(logger_name)
        logger.handlers = [console_handler, file_handler]
        logger.setLevel(log_level)
        logger.propagate = False  # Avoid duplicating to root logger

    logging.info(
        f"🚀 Logging initialized. Level: {logging.getLevelName(log_level)}, File: {settings.LOG_FILE}")

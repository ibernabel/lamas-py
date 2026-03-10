import os
import shutil
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Optional

import aiofiles
import boto3
from botocore.config import Config
from app.core.config import settings


class AbstractStorageService(ABC):
    """Abstract base class for storage services."""

    @abstractmethod
    async def upload(self, file_content: bytes, key: str, content_type: str) -> str:
        """Upload a file and return its URL or key."""
        pass

    @abstractmethod
    async def get_url(self, key: str) -> str:
        """Get a temporary or public URL for a file key."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete a file by its key."""
        pass


class LocalStorageService(AbstractStorageService):
    """Local filesystem storage implementation."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def upload(self, file_content: bytes, key: str, content_type: str) -> str:
        file_path = self.base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(file_path, mode="wb") as f:
            await f.write(file_content)

        return str(key)

    async def get_url(self, key: str) -> str:
        # In local dev, we might serve this via a static route
        return f"/api/v1/documents/download/{key}"

    async def delete(self, key: str) -> bool:
        file_path = self.base_path / key
        if file_path.exists():
            file_path.unlink()
            return True
        return False


class R2StorageService(AbstractStorageService):
    """Cloudflare R2 storage implementation (S3 compatible)."""

    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        self.bucket = settings.R2_BUCKET_NAME

    async def upload(self, file_content: bytes, key: str, content_type: str) -> str:
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_content,
            ContentType=content_type,
        )
        return key

    async def get_url(self, key: str) -> str:
        # Generate a signed URL for secure access
        return self.s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=3600,  # 1 hour
        )

    async def delete(self, key: str) -> bool:
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False


def get_storage_service() -> AbstractStorageService:
    """Factory to get the configured storage service."""
    if settings.STORAGE_BACKEND == "r2":
        return R2StorageService()
    return LocalStorageService(settings.STORAGE_LOCAL_UPLOAD_DIR)

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentRead(BaseModel):
    """Schema for reading document metadata."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    loan_application_id: Optional[int] = None
    document_type: str
    bank_name: Optional[str] = None
    file_name: str
    file_size_bytes: int
    content_type: str
    uploaded_at: datetime
    is_latest: bool
    download_url: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""
    id: int
    file_name: str
    document_type: str
    download_url: str

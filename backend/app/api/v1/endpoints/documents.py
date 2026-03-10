from datetime import datetime, timezone
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from sqlmodel import select, and_

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.models.document import CustomerDocument
from app.schemas.document import DocumentRead, DocumentUploadResponse
from app.services.storage import get_storage_service

router = APIRouter()


@router.post("/customers/{customer_id}/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_customer_document(
    current_user: CurrentUser,
    session: DatabaseSession,
    customer_id: int,
    document_type: str = Query(
        ..., description="nid | labor_letter | bank_statement | credit_report"),
    bank_name: Optional[str] = Query(
        None, description="Only for bank_statement"),
    file: UploadFile = File(...),
):
    """Upload a document for a customer."""
    # 1. Read file content
    content = await file.read()
    file_size = len(content)

    # 2. Prepare storage key
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    file_key = f"clients/{customer_id}/{document_type}/{timestamp}_{file.filename}"

    # 3. Upload to storage
    storage = get_storage_service()
    await storage.upload(content, file_key, file.content_type)

    # 4. Handle versioning: mark previous as not latest
    query = select(CustomerDocument).where(
        and_(
            CustomerDocument.customer_id == customer_id,
            CustomerDocument.document_type == document_type,
            CustomerDocument.bank_name == bank_name,
            CustomerDocument.is_latest == True
        )
    )
    results = session.exec(query)
    for doc in results:
        doc.is_latest = False
        session.add(doc)

    # 5. Create DB record
    db_doc = CustomerDocument(
        customer_id=customer_id,
        document_type=document_type,
        bank_name=bank_name,
        file_key=file_key,
        file_name=file.filename,
        file_size_bytes=file_size,
        content_type=file.content_type,
        storage_backend="local" if storage.__class__.__name__ == "LocalStorageService" else "r2",
        uploaded_by=current_user.id,
        uploaded_at=datetime.now(timezone.utc),
        is_latest=True
    )
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # 6. Generate download URL
    download_url = await storage.get_url(file_key)

    return {
        "id": db_doc.id,
        "file_name": db_doc.file_name,
        "document_type": db_doc.document_type,
        "download_url": download_url
    }


@router.post("/loans/{loan_id}/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_loan_document(
    current_user: CurrentUser,
    session: DatabaseSession,
    loan_id: int,
    document_type: str = Query(...,
                               description="bank_statement | credit_report"),
    bank_name: Optional[str] = Query(
        None, description="Only for bank_statement"),
    file: UploadFile = File(...),
):
    """Upload a document for a loan application."""
    # 0. Get loan to find customer_id
    from app.models.loan_application import LoanApplication
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        raise HTTPException(
            status_code=404, detail="Loan application not found")

    # 1. Read file content
    content = await file.read()
    file_size = len(content)

    # 2. Prepare storage key
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    file_key = f"cases/{loan_id}/{document_type}/{timestamp}_{file.filename}"

    # 3. Upload to storage
    storage = get_storage_service()
    await storage.upload(content, file_key, file.content_type)

    # 4. Handle versioning: mark previous as not latest for this loan/type
    query = select(CustomerDocument).where(
        and_(
            CustomerDocument.loan_application_id == loan_id,
            CustomerDocument.document_type == document_type,
            CustomerDocument.bank_name == bank_name,
            CustomerDocument.is_latest == True
        )
    )
    results = session.exec(query)
    for doc in results:
        doc.is_latest = False
        session.add(doc)

    # 5. Create DB record
    db_doc = CustomerDocument(
        customer_id=loan.customer_id,
        loan_application_id=loan_id,
        document_type=document_type,
        bank_name=bank_name,
        file_key=file_key,
        file_name=file.filename,
        file_size_bytes=file_size,
        content_type=file.content_type,
        storage_backend="local" if storage.__class__.__name__ == "LocalStorageService" else "r2",
        uploaded_by=current_user.id,
        uploaded_at=datetime.now(timezone.utc),
        is_latest=True
    )
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # 6. Generate download URL
    download_url = await storage.get_url(file_key)

    return {
        "id": db_doc.id,
        "file_name": db_doc.file_name,
        "document_type": db_doc.document_type,
        "download_url": download_url
    }


@router.get("/customers/{customer_id}", response_model=List[DocumentRead])
async def list_customer_documents(
    session: DatabaseSession,
    customer_id: int,
    include_history: bool = Query(False, description="Include old versions"),
):
    """List documents for a customer."""
    query = select(CustomerDocument).where(
        CustomerDocument.customer_id == customer_id)
    if not include_history:
        query = query.where(CustomerDocument.is_latest == True)

    query = query.order_by(CustomerDocument.uploaded_at.desc())
    results = session.exec(query)
    documents = results.all()

    storage = get_storage_service()
    # Enrich with URLs
    enriched_docs = []
    for doc in documents:
        doc_data = DocumentRead.model_validate(doc)
        doc_data.download_url = await storage.get_url(doc.file_key)
        enriched_docs.append(doc_data)

    return enriched_docs


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    current_user: CurrentUser,
    document_id: int,
    session: DatabaseSession,
):
    """Delete a document."""
    db_doc = session.get(CustomerDocument, document_id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 1. Delete from storage
    storage = get_storage_service()
    await storage.delete(db_doc.file_key)

    # 2. Delete from DB
    session.delete(db_doc)
    session.commit()

    return None


@router.get("/{document_id}/download")
async def get_document_download_url(
    current_user: CurrentUser,
    document_id: int,
    session: DatabaseSession,
):
    """Get a temporary download URL for a specific document."""
    db_doc = session.get(CustomerDocument, document_id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")

    storage = get_storage_service()
    download_url = await storage.get_url(db_doc.file_key)

    return {"download_url": download_url}

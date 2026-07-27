"""
Import CSV Endpoints - FastAPI endpoint for importing SoliPres CSV files into Lamas.
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.models.user import User
from app.services.import_service import SoliPresCSVImporter

router = APIRouter()


@router.post(
    "/import-csv",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, Any],
    summary="Import SoliPres CSV export into Lamas",
    description="Parses full CSV exports from SoliPres, deduplicating Customers by NID and creating LoanApplications."
)
async def import_solipres_csv(
    session: DatabaseSession,
    current_user: CurrentUser,
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Import SoliPres CSV file. Requires authenticated user.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid CSV file."
        )

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8-sig", errors="replace")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading uploaded file: {str(exc)}"
        )

    importer = SoliPresCSVImporter(session)
    result = importer.import_csv_content(content_str)
    return result

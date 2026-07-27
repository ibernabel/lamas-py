"""
Customer document model for file management and versioning.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.loan_application import LoanApplication
    from app.models.user import User


class CustomerDocument(SQLModel, table=True):
    """
    Customer document database model.
    Supports versioning via uploaded_at and is_latest.
    
    Document Types supported:
    - nid: Cédula de Identidad del solicitante
    - guarantor_nid: Cédula de Identidad del garante/codeudor/cónyuge
    - labor_letter: Carta de trabajo
    - pay_stub: Volante de pago de nómina
    - bank_statement: Estado de cuenta bancario (requiere bank_name)
    - credit_report: Reporte de buró de crédito
    - tax_declaration: Declaración de impuestos IR-1 / IR-2
    - business_financial_statement: Estados financieros de negocio
    - vehicle_registration: Matrícula / Título de vehículo
    - property_title: Título de propiedad inmobiliaria
    - collateral_appraisal: Tasación pericial de garantía
    - bureau_authorization: Autorización firmada de buró de crédito (Ley 172-13)
    - chat_transcript: Transcripción / Exportación de chat de WhatsApp
    - utility_bill: Comprobante de servicio residencial
    - other_support: Comprobante o documento de soporte adicional
    """
    __tablename__ = "customer_documents"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    loan_application_id: int | None = Field(
        default=None, foreign_key="loan_applications.id", index=True)

    # Document Type
    document_type: str = Field(max_length=50, index=True)

    # Bank name for bank statements (bhd, popular, banreservas, etc.)
    bank_name: Optional[str] = Field(default=None, max_length=50)

    # File details
    file_key: str = Field(max_length=255, unique=True,
                          description="Storage key: clients/123/nid/...")
    file_name: str = Field(max_length=255, description="Original filename")
    file_size_bytes: int = Field(description="Size in bytes")
    content_type: str = Field(max_length=100, description="MIME type")

    # Storage info
    storage_backend: str = Field(
        default="local", max_length=20, description="local | r2")

    # Metadata
    uploaded_by: Optional[int] = Field(default=None, foreign_key="users.id")
    uploaded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    is_latest: bool = Field(
        default=True, description="True if this is the active version")

    # Relationships
    customer: "Customer" = Relationship(back_populates="documents")
    loan_application: Optional["LoanApplication"] = Relationship(
        back_populates="documents")
    uploader: Optional["User"] = Relationship(
        back_populates="uploaded_documents")

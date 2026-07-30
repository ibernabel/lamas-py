"""
Import Service - Business logic for importing legacy SoliPres CSV files into Lamas.
"""
import csv
import io
import re
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Tuple

from sqlmodel import Session, select

from app.models.customer import (
    Customer,
    CustomerDetail,
    CustomerFinancialInfo,
    CustomerJobInfo,
    CustomerReference,
    Company,
)
from app.models.loan_application import LoanApplication, LoanApplicationDetail, LoanApplicationNote
from app.models.address import Address, Addressable
from app.models.phone import Phone


def sanitize_nid(raw_nid: Optional[str]) -> str:
    """Clean NID string removing hyphens, spaces, and non-digits."""
    if not raw_nid:
        return ""
    digits = re.sub(r"\D", "", str(raw_nid))
    return digits[:11]


def parse_float(raw_val: Optional[str]) -> Optional[float]:
    """Parse numeric currency strings (e.g. '150,000.00', 'RD$ 20,000') to float."""
    if not raw_val:
        return None
    cleaned = re.sub(r"[^\d.]", "", str(raw_val).replace(",", ""))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def parse_int(raw_val: Optional[str]) -> Optional[int]:
    """Parse integer strings (e.g. '24 Meses', '24') to int."""
    if not raw_val:
        return None
    match = re.search(r"\d+", str(raw_val))
    if match:
        return int(match.group(0))
    return None


def parse_date(raw_val: Optional[str]) -> Optional[date]:
    """Parse date strings (YYYY-MM-DD) or return None."""
    if not raw_val:
        return None
    raw_str = str(raw_val).strip()
    if not raw_str or raw_str.upper() in ("N/A", "NULL", "NONE"):
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(raw_str.split(" ")[0], fmt).date()
        except ValueError:
            continue
    return None


def parse_datetime(raw_val: Optional[str]) -> Optional[datetime]:
    """Parse datetime strings or return None."""
    if not raw_val:
        return datetime.utcnow()
    raw_str = str(raw_val).strip()
    if not raw_str or raw_str.upper() in ("N/A", "NULL", "NONE"):
        return datetime.utcnow()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw_str, fmt)
        except ValueError:
            continue
    return datetime.utcnow()


def map_solipres_status(solipres_status: Optional[str]) -> str:
    """Map SoliPres estatus to Lamas LoanStatus enum values."""
    if not solipres_status:
        return "received"
    status_upper = str(solipres_status).strip().upper()
    mapping = {
        "APROBADA": "approved",
        "RECHAZADA": "rejected",
        "RECIBIDA": "received",
        "VERIFICADA": "verified",
        "ANALIZADA": "analyzed",
        "ARCHIVADA": "archived",
    }
    return mapping.get(status_upper, "received")


class SoliPresCSVImporter:
    """Importer engine for SoliPres CSV exports into Lamas."""

    def __init__(self, session: Session):
        self.session = session

    def import_csv_content(self, csv_content: str) -> Dict[str, Any]:
        """
        Process CSV text content line by line, deduplicating Customers by NID.

        Returns a summary report dictionary.
        """
        # Remove BOM if present
        if csv_content.startswith("\ufeff"):
            csv_content = csv_content[1:]

        reader = csv.DictReader(io.StringIO(csv_content))
        
        processed_rows = 0
        customers_created = 0
        customers_updated = 0
        applications_created = 0
        errors: List[Dict[str, Any]] = []

        for row_index, row in enumerate(reader, start=2): # 1-indexed header is row 1
            try:
                with self.session.begin_nested():
                    raw_nid = row.get("Cedula") or row.get("cedula")
                    cleaned_nid = sanitize_nid(raw_nid)

                    if not cleaned_nid:
                        errors.append({
                            "row": row_index,
                            "error": "Falta cédula válida o NID en el registro"
                        })
                        continue

                    # Search existing customer by NID
                    customer = self.session.exec(
                        select(Customer).where(Customer.nid == cleaned_nid)
                    ).first()

                    is_new_customer = False
                    if not customer:
                        raw_ref = (row.get("Referidopor") or row.get("referidopor") or "").strip()
                        sanitized_ref = sanitize_nid(raw_ref) if raw_ref else None
                        ref_val = (sanitized_ref or raw_ref)[:11] if raw_ref else None

                        lead_ch = row.get("Como_Se_Entero") or row.get("como_se_entero")
                        if lead_ch:
                            lead_ch = str(lead_ch)[:255]

                        customer = Customer(
                            nid=cleaned_nid,
                            lead_channel=lead_ch,
                            is_referred=(row.get("Referido") or row.get("referido")) in ("Si", "si", "SI", "1", "True", "true"),
                            referred_by=ref_val,
                            is_active=True
                        )
                        self.session.add(customer)
                        self.session.flush()
                        customers_created += 1
                        is_new_customer = True
                    else:
                        customers_updated += 1

                    # Split name into first and last name
                    full_name = (row.get("Nombre_y_Apellido") or row.get("nombre_y_apellido") or "").strip()
                    name_parts = full_name.split(" ", 1)
                    first_name = (name_parts[0] if name_parts else "N/A")[:255]
                    last_name = (name_parts[1] if len(name_parts) > 1 else None)
                    if last_name:
                        last_name = last_name[:255]

                    # Upsert CustomerDetail
                    if is_new_customer or not customer.detail:
                        email_val = row.get("Correo_Electronico") or row.get("correo_electronico")
                        if email_val:
                            email_val = str(email_val)[:255]
                        nickname_val = row.get("Apodo") or row.get("apodo")
                        if nickname_val:
                            nickname_val = str(nickname_val)[:255]

                        detail = CustomerDetail(
                            customer_id=customer.id,
                            first_name=first_name,
                            last_name=last_name,
                            email=email_val,
                            nickname=nickname_val,
                            birthday=parse_date(row.get("Fecha_Nacimiento") or row.get("fecha_nacimiento")),
                            gender=(str(row.get("Genero") or row.get("genero"))[:50]) if (row.get("Genero") or row.get("genero")) else None,
                            marital_status=(str(row.get("Estado_Civil") or row.get("estado_civil"))[:50]) if (row.get("Estado_Civil") or row.get("estado_civil")) else None,
                            education_level=(str(row.get("Nivel_Edu") or row.get("nivel_edu"))[:100]) if (row.get("Nivel_Edu") or row.get("nivel_edu")) else None,
                            housing_type=(str(row.get("Casa") or row.get("casa"))[:100]) if (row.get("Casa") or row.get("casa")) else None
                        )
                        self.session.add(detail)

                    # Upsert Job Info
                    if is_new_customer or not customer.job_info:
                        role_val = row.get("Cargo") or row.get("cargo")
                        bank_val = row.get("Banco_Nomina") or row.get("banco_nomina")
                        sched_val = row.get("Horario_Laboral") or row.get("horario_laboral")
                        boss_val = row.get("Jefe_Inmed") or row.get("jefe_inmed")

                        job_info = CustomerJobInfo(
                            customer_id=customer.id,
                            role=str(role_val)[:255] if role_val else None,
                            salary=parse_float(row.get("Sueldo") or row.get("sueldo")),
                            start_date=parse_date(row.get("Fecha_Ingreso_Trabajo") or row.get("fecha_ingreso_trabajo")),
                            payment_bank=str(bank_val)[:255] if bank_val else None,
                            schedule=str(sched_val)[:255] if sched_val else None,
                            supervisor_name=str(boss_val)[:255] if boss_val else None
                        )
                        self.session.add(job_info)

                    # Upsert Financial Info
                    if is_new_customer or not customer.financial_info:
                        fin_info = CustomerFinancialInfo(
                            customer_id=customer.id,
                            other_incomes=parse_float(row.get("Otros_Ingresos") or row.get("otros_ingresos")),
                            monthly_housing_payment=parse_float(row.get("Renta_Casa") or row.get("renta_casa")),
                            guarantee_assets=row.get("Posee_Bienes") or row.get("posee_bienes")
                        )
                        self.session.add(fin_info)

                    # References (Ref 1 and Ref 2)
                    ref1_name = row.get("Nombre_Referencia1") or row.get("nombre_referencia1")
                    if ref1_name and is_new_customer:
                        ref1 = CustomerReference(
                            customer_id=customer.id,
                            name=str(ref1_name)[:255],
                            relationship=(str(row.get("Parentesco_Referencia1") or row.get("parentesco_referencia1") or "Personal")[:100]),
                            address=row.get("Direccion_Referencia1") or row.get("direccion_referencia1")
                        )
                        self.session.add(ref1)

                    ref2_name = row.get("Nombre_Referencia2") or row.get("nombre_referencia2")
                    if ref2_name and is_new_customer:
                        ref2 = CustomerReference(
                            customer_id=customer.id,
                            name=str(ref2_name)[:255],
                            relationship=(str(row.get("Parentesco_Referencia2") or row.get("parentesco_referencia2") or "Personal")[:100]),
                            address=row.get("Direccion_Referencia2") or row.get("direccion_referencia2")
                        )
                        self.session.add(ref2)

                    # Conviviente as spouse reference
                    conviviente_name = row.get("Nombre_Conviviente") or row.get("nombre_conviviente")
                    if conviviente_name and is_new_customer:
                        ref_spouse = CustomerReference(
                            customer_id=customer.id,
                            name=str(conviviente_name)[:255],
                            relationship="spouse",
                            type="conviviente",
                            occupation=(str(row.get("Trabajo_Conviviente") or row.get("trabajo_conviviente"))[:255]) if (row.get("Trabajo_Conviviente") or row.get("trabajo_conviviente")) else None
                        )
                        self.session.add(ref_spouse)

                    # Phones
                    mobile_num = row.get("Telefono_Celular") or row.get("telefono_celular")
                    if mobile_num:
                        mobile_num = str(mobile_num).strip()[:50]
                    if mobile_num and is_new_customer:
                        phone_mobile = Phone(
                            number=mobile_num,
                            type="mobile",
                            phoneable_id=customer.id,
                            phoneable_type="Customer"
                        )
                        self.session.add(phone_mobile)

                    # Create Loan Application
                    created_at_dt = parse_datetime(row.get("Fecha_y_Hora") or row.get("fecha_y_hora"))
                    status_mapped = map_solipres_status(row.get("Estatus") or row.get("estatus"))
                    
                    loan_app = LoanApplication(
                        customer_id=customer.id,
                        status=status_mapped,
                        is_approved=(status_mapped == "approved"),
                        is_rejected=(status_mapped == "rejected"),
                        is_archived=(str(row.get("Solicitud_Archivada") or row.get("solicitud_archivada")).strip() in ("1", "true", "True")),
                        created_at=created_at_dt
                    )
                    self.session.add(loan_app)
                    self.session.flush()
                    applications_created += 1

                    # Create Loan Application Details
                    freq_val = row.get("Frecuencia_Prestamo") or row.get("frecuencia_prestamo")
                    loan_detail = LoanApplicationDetail(
                        loan_application_id=loan_app.id,
                        amount=parse_float(row.get("Monto_Prestamo") or row.get("monto_prestamo")) or 0.0,
                        term=parse_int(row.get("Plazo") or row.get("plazo")) or 0,
                        quota=parse_float(row.get("Monto_Cuotas") or row.get("monto_cuotas")) or 0.0,
                        frequency=str(freq_val)[:50] if freq_val else None,
                        purpose=row.get("Uso_Prestamo") or row.get("uso_prestamo"),
                        customer_comment=row.get("Comentario_Cliente") or row.get("comentario_cliente")
                    )
                    self.session.add(loan_detail)

                    # Create Loan Application Notes
                    comment = row.get("Comentario") or row.get("comentario")
                    notes_reg = row.get("Registro_Notas") or row.get("registro_notas")
                    combined_notes = []
                    if comment:
                        combined_notes.append(f"Comentario SoliPres: {comment}")
                    if notes_reg:
                        combined_notes.append(f"Histórico Notas: {notes_reg}")

                    if combined_notes:
                        note_obj = LoanApplicationNote(
                            loan_application_id=loan_app.id,
                            note="\n".join(combined_notes)
                        )
                        self.session.add(note_obj)

                processed_rows += 1

            except Exception as e:
                errors.append({
                    "row": row_index,
                    "error": str(e)
                })

        self.session.commit()

        return {
            "processed_rows": processed_rows,
            "customers_created": customers_created,
            "customers_updated": customers_updated,
            "loan_applications_created": applications_created,
            "errors": errors
        }

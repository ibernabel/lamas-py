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
                    if not customer.detail:
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
                    else:
                        if first_name and first_name != "N/A":
                            customer.detail.first_name = first_name
                        if last_name:
                            customer.detail.last_name = last_name
                        email_val = row.get("Correo_Electronico") or row.get("correo_electronico")
                        if email_val:
                            customer.detail.email = str(email_val)[:255]
                        nickname_val = row.get("Apodo") or row.get("apodo")
                        if nickname_val:
                            customer.detail.nickname = str(nickname_val)[:255]
                        if bday := parse_date(row.get("Fecha_Nacimiento") or row.get("fecha_nacimiento")):
                            customer.detail.birthday = bday
                        if gen := (row.get("Genero") or row.get("genero")):
                            customer.detail.gender = str(gen)[:50]
                        if est_civil := (row.get("Estado_Civil") or row.get("estado_civil")):
                            customer.detail.marital_status = str(est_civil)[:50]
                        if edu := (row.get("Nivel_Edu") or row.get("nivel_edu")):
                            customer.detail.education_level = str(edu)[:100]
                        if casa := (row.get("Casa") or row.get("casa")):
                            customer.detail.housing_type = str(casa)[:100]
                        customer.detail.updated_at = datetime.utcnow()

                    # Upsert Customer Address (Home)
                    home_address_str = (row.get("Direccion_Vivienda") or row.get("direccion_vivienda") or "").strip()
                    provincia_str = (row.get("Provincia_Vivienda") or row.get("provincia_vivienda") or "").strip()
                    ubicacion_str = (row.get("Ubicacion") or row.get("ubicacion") or "").strip()
                    tiempo_sector_str = (row.get("Tiempo_Sector") or row.get("tiempo_sector") or "").strip()

                    if home_address_str or provincia_str:
                        ref_notes = []
                        if ubicacion_str:
                            ref_notes.append(f"Ubicación: {ubicacion_str}")
                        if tiempo_sector_str:
                            ref_notes.append(f"Tiempo sector: {tiempo_sector_str}")
                        combined_ref_notes = " | ".join(ref_notes) if ref_notes else None

                        existing_home = self.session.exec(
                            select(Address).join(Addressable, Address.id == Addressable.address_id).where(
                                Addressable.addressable_type == "Customer",
                                Addressable.addressable_id == customer.id,
                                Address.type == "home"
                            )
                        ).first()

                        if existing_home:
                            if home_address_str:
                                existing_home.street = home_address_str[:255]
                                existing_home.street2 = home_address_str[255:510] if len(home_address_str) > 255 else None
                            if provincia_str:
                                existing_home.state = provincia_str[:100]
                                existing_home.city = provincia_str[:100]
                            if combined_ref_notes:
                                existing_home.references = combined_ref_notes[:500]
                            existing_home.updated_at = datetime.utcnow()
                        else:
                            cust_address = Address(
                                street=home_address_str[:255] if home_address_str else "N/A",
                                street2=home_address_str[255:510] if len(home_address_str) > 255 else None,
                                state=provincia_str[:100] if provincia_str else None,
                                city=provincia_str[:100] if provincia_str else None,
                                type="home",
                                country="República Dominicana",
                                references=combined_ref_notes[:500] if combined_ref_notes else None
                            )
                            self.session.add(cust_address)
                            self.session.flush()

                            cust_addressable = Addressable(
                                address_id=cust_address.id,
                                addressable_type="Customer",
                                addressable_id=customer.id
                            )
                            self.session.add(cust_addressable)

                    # Upsert Company
                    company_name = (row.get("Nombre_Empresa") or row.get("nombre_empresa") or "").strip()
                    if company_name:
                        company_type = (row.get("Tipo_Empresa") or row.get("tipo_empresa") or "").strip()
                        company_dept = (row.get("Depto_Trabajo") or row.get("depto_trabajo") or "").strip()
                        company_code = (row.get("Codigo_Empresa") or row.get("codigo_empresa") or "").strip()

                        if not customer.company:
                            company = Company(
                                customer_id=customer.id,
                                name=company_name[:255],
                                type=company_type[:100] if company_type else None,
                                department=company_dept[:255] if company_dept else None,
                                rnc=company_code[:50] if company_code else None
                            )
                            self.session.add(company)
                            self.session.flush()
                        else:
                            company = customer.company
                            company.name = company_name[:255]
                            if company_type: company.type = company_type[:100]
                            if company_dept: company.department = company_dept[:255]
                            if company_code: company.rnc = company_code[:50]
                            company.updated_at = datetime.utcnow()

                        company_address_str = (row.get("Direccion_Empresa") or row.get("direccion_empresa") or "").strip()
                        if company_address_str:
                            existing_comp_addr = self.session.exec(
                                select(Address).join(Addressable, Address.id == Addressable.address_id).where(
                                    Addressable.addressable_type == "Company",
                                    Addressable.addressable_id == company.id,
                                    Address.type == "work"
                                )
                            ).first()
                            if existing_comp_addr:
                                existing_comp_addr.street = company_address_str[:255]
                                existing_comp_addr.street2 = company_address_str[255:510] if len(company_address_str) > 255 else None
                                existing_comp_addr.updated_at = datetime.utcnow()
                            else:
                                comp_address = Address(
                                    street=company_address_str[:255],
                                    street2=company_address_str[255:510] if len(company_address_str) > 255 else None,
                                    type="work",
                                    country="República Dominicana"
                                )
                                self.session.add(comp_address)
                                self.session.flush()

                                comp_addressable = Addressable(
                                    address_id=comp_address.id,
                                    addressable_type="Company",
                                    addressable_id=company.id
                                )
                                self.session.add(comp_addressable)

                        company_phone_num = (row.get("Telefono_Empresa") or row.get("telefono_empresa") or "").strip()
                        if company_phone_num:
                            company_phone_ext = (row.get("Ext_Empresa") or row.get("ext_empresa") or "").strip()
                            existing_comp_phone = self.session.exec(
                                select(Phone).where(
                                    Phone.phoneable_type == "Company",
                                    Phone.phoneable_id == company.id,
                                    Phone.type == "work"
                                )
                            ).first()
                            if existing_comp_phone:
                                existing_comp_phone.number = company_phone_num[:50]
                                if company_phone_ext: existing_comp_phone.extension = company_phone_ext[:10]
                                existing_comp_phone.updated_at = datetime.utcnow()
                            else:
                                comp_phone = Phone(
                                    number=company_phone_num[:50],
                                    extension=company_phone_ext[:10] if company_phone_ext else None,
                                    type="work",
                                    phoneable_id=company.id,
                                    phoneable_type="Company"
                                )
                                self.session.add(comp_phone)

                    # Upsert Job Info
                    role_val = row.get("Cargo") or row.get("cargo")
                    bank_val = row.get("Banco_Nomina") or row.get("banco_nomina")
                    sched_val = row.get("Horario_Laboral") or row.get("horario_laboral")
                    boss_val = row.get("Jefe_Inmed") or row.get("jefe_inmed")
                    ocupation_val = row.get("Ocupacion") or row.get("ocupacion")

                    if not customer.job_info:
                        job_info = CustomerJobInfo(
                            customer_id=customer.id,
                            role=str(role_val)[:255] if role_val else None,
                            salary=parse_float(row.get("Sueldo") or row.get("sueldo")),
                            start_date=parse_date(row.get("Fecha_Ingreso_Trabajo") or row.get("fecha_ingreso_trabajo")),
                            payment_bank=str(bank_val)[:255] if bank_val else None,
                            schedule=str(sched_val)[:255] if sched_val else None,
                            supervisor_name=str(boss_val)[:255] if boss_val else None,
                            occupation_type=str(ocupation_val)[:50] if ocupation_val else None
                        )
                        self.session.add(job_info)
                    else:
                        if role_val: customer.job_info.role = str(role_val)[:255]
                        if sal := parse_float(row.get("Sueldo") or row.get("sueldo")): customer.job_info.salary = sal
                        if sdate := parse_date(row.get("Fecha_Ingreso_Trabajo") or row.get("fecha_ingreso_trabajo")): customer.job_info.start_date = sdate
                        if bank_val: customer.job_info.payment_bank = str(bank_val)[:255]
                        if sched_val: customer.job_info.schedule = str(sched_val)[:255]
                        if boss_val: customer.job_info.supervisor_name = str(boss_val)[:255]
                        if ocupation_val: customer.job_info.occupation_type = str(ocupation_val)[:50]
                        customer.job_info.updated_at = datetime.utcnow()

                    # Upsert Financial Info
                    other_inc = parse_float(row.get("Otros_Ingresos") or row.get("otros_ingresos"))
                    renta_c = parse_float(row.get("Renta_Casa") or row.get("renta_casa"))
                    bienes_val = row.get("Posee_Bienes") or row.get("posee_bienes")

                    if not customer.financial_info:
                        fin_info = CustomerFinancialInfo(
                            customer_id=customer.id,
                            other_incomes=other_inc,
                            monthly_housing_payment=renta_c,
                            guarantee_assets=bienes_val
                        )
                        self.session.add(fin_info)
                    else:
                        if other_inc is not None: customer.financial_info.other_incomes = other_inc
                        if renta_c is not None: customer.financial_info.monthly_housing_payment = renta_c
                        if bienes_val: customer.financial_info.guarantee_assets = bienes_val
                        customer.financial_info.updated_at = datetime.utcnow()

                    # Phones for Customer (Mobile and Home)
                    mobile_num = (row.get("Telefono_Celular") or row.get("telefono_celular") or "").strip()
                    if mobile_num:
                        existing_mobile = self.session.exec(
                            select(Phone).where(
                                Phone.phoneable_type == "Customer",
                                Phone.phoneable_id == customer.id,
                                Phone.type == "mobile"
                            )
                        ).first()
                        if existing_mobile:
                            existing_mobile.number = mobile_num[:50]
                            existing_mobile.updated_at = datetime.utcnow()
                        else:
                            phone_mobile = Phone(
                                number=mobile_num[:50],
                                type="mobile",
                                phoneable_id=customer.id,
                                phoneable_type="Customer"
                            )
                            self.session.add(phone_mobile)

                    home_phone_num = (row.get("Telefono_Casa") or row.get("telefono_casa") or "").strip()
                    if home_phone_num:
                        existing_home_phone = self.session.exec(
                            select(Phone).where(
                                Phone.phoneable_type == "Customer",
                                Phone.phoneable_id == customer.id,
                                Phone.type == "home"
                            )
                        ).first()
                        if existing_home_phone:
                            existing_home_phone.number = home_phone_num[:50]
                            existing_home_phone.updated_at = datetime.utcnow()
                        else:
                            phone_home = Phone(
                                number=home_phone_num[:50],
                                type="home",
                                phoneable_id=customer.id,
                                phoneable_type="Customer"
                            )
                            self.session.add(phone_home)

                    # References (Ref 1 and Ref 2)
                    ref1_name = (row.get("Nombre_Referencia1") or row.get("nombre_referencia1") or "").strip()
                    if ref1_name and is_new_customer:
                        ref1_tel = (row.get("Telefono_Referencia1") or row.get("telefono_referencia1") or "").strip()
                        ref1_addr = (row.get("Direccion_Referencia1") or row.get("direccion_referencia1") or "").strip()
                        full_ref1_addr = ref1_addr
                        if ref1_tel:
                            full_ref1_addr = f"{ref1_addr} (Tel: {ref1_tel})" if ref1_addr else f"Tel: {ref1_tel}"

                        ref1 = CustomerReference(
                            customer_id=customer.id,
                            name=ref1_name[:255],
                            relationship=(str(row.get("Parentesco_Referencia1") or row.get("parentesco_referencia1") or "Personal")[:100]),
                            address=full_ref1_addr
                        )
                        self.session.add(ref1)
                        self.session.flush()

                        if ref1_tel:
                            ref1_phone = Phone(
                                number=ref1_tel[:50],
                                type="mobile",
                                phoneable_id=ref1.id,
                                phoneable_type="CustomerReference"
                            )
                            self.session.add(ref1_phone)

                    ref2_name = (row.get("Nombre_Referencia2") or row.get("nombre_referencia2") or "").strip()
                    if ref2_name and is_new_customer:
                        ref2_tel = (row.get("Telefono_Referencia2") or row.get("telefono_referencia2") or "").strip()
                        ref2_addr = (row.get("Direccion_Referencia2") or row.get("direccion_referencia2") or "").strip()
                        full_ref2_addr = ref2_addr
                        if ref2_tel:
                            full_ref2_addr = f"{ref2_addr} (Tel: {ref2_tel})" if ref2_addr else f"Tel: {ref2_tel}"

                        ref2 = CustomerReference(
                            customer_id=customer.id,
                            name=ref2_name[:255],
                            relationship=(str(row.get("Parentesco_Referencia2") or row.get("parentesco_referencia2") or "Personal")[:100]),
                            address=full_ref2_addr
                        )
                        self.session.add(ref2)
                        self.session.flush()

                        if ref2_tel:
                            ref2_phone = Phone(
                                number=ref2_tel[:50],
                                type="mobile",
                                phoneable_id=ref2.id,
                                phoneable_type="CustomerReference"
                            )
                            self.session.add(ref2_phone)

                    # Conviviente as spouse reference
                    conviviente_name = (row.get("Nombre_Conviviente") or row.get("nombre_conviviente") or "").strip()
                    if conviviente_name and is_new_customer:
                        conviviente_cel = (row.get("Celular_Conviviente") or row.get("celular_conviviente") or "").strip()
                        conviviente_addr = f"Tel: {conviviente_cel}" if conviviente_cel else None

                        ref_spouse = CustomerReference(
                            customer_id=customer.id,
                            name=conviviente_name[:255],
                            relationship="spouse",
                            type="conviviente",
                            address=conviviente_addr,
                            occupation=(str(row.get("Trabajo_Conviviente") or row.get("trabajo_conviviente"))[:255]) if (row.get("Trabajo_Conviviente") or row.get("trabajo_conviviente")) else None
                        )
                        self.session.add(ref_spouse)
                        self.session.flush()

                        if conviviente_cel:
                            spouse_phone = Phone(
                                number=conviviente_cel[:50],
                                type="mobile",
                                phoneable_id=ref_spouse.id,
                                phoneable_type="CustomerReference"
                            )
                            self.session.add(spouse_phone)

                    # Phones for Customer (Mobile and Home)
                    if is_new_customer:
                        mobile_num = (row.get("Telefono_Celular") or row.get("telefono_celular") or "").strip()
                        if mobile_num:
                            phone_mobile = Phone(
                                number=mobile_num[:50],
                                type="mobile",
                                phoneable_id=customer.id,
                                phoneable_type="Customer"
                            )
                            self.session.add(phone_mobile)

                        home_phone_num = (row.get("Telefono_Casa") or row.get("telefono_casa") or "").strip()
                        if home_phone_num:
                            phone_home = Phone(
                                number=home_phone_num[:50],
                                type="home",
                                phoneable_id=customer.id,
                                phoneable_type="Customer"
                            )
                            self.session.add(phone_home)

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

                    # Create Loan Application Notes (Enriched)
                    solipres_id = row.get("ID") or row.get("id")
                    comment = row.get("Comentario") or row.get("comentario")
                    notes_reg = row.get("Registro_Notas") or row.get("registro_notas")
                    advisor = row.get("Asesor_Designado") or row.get("asesor_designado")
                    cuotas_conv = row.get("Cuotas_Conveniente") or row.get("cuotas_conveniente")
                    dependientes = row.get("Persona_Dependientes") or row.get("persona_dependientes")
                    grupo_fam = row.get("Grupo_Familiar") or row.get("grupo_familiar")
                    tipo_solic = row.get("Tipo_Solicitud") or row.get("tipo_solicitud")
                    buro_data = row.get("Puntuacion_Data") or row.get("puntuacion_data")
                    buro_inst = row.get("Institucion_Historial") or row.get("institucion_historial")
                    buro_monto = row.get("Monto_Historial") or row.get("monto_historial")

                    combined_notes = []
                    if solipres_id:
                        combined_notes.append(f"ID SoliPres original: {solipres_id}")
                    if tipo_solic:
                        combined_notes.append(f"Tipo Solicitud: {tipo_solic}")
                    if advisor:
                        combined_notes.append(f"Asesor Designado: {advisor}")
                    if cuotas_conv:
                        combined_notes.append(f"Cuota Sugerida/Conveniente: RD$ {cuotas_conv}")
                    if dependientes or grupo_fam:
                        combined_notes.append(f"Carga Familiar: Dependientes={dependientes or 'N/A'}, Grupo={grupo_fam or 'N/A'}")
                    if buro_data or buro_inst or buro_monto:
                        combined_notes.append(f"Histórico/Buró SoliPres: {buro_data or ''} | {buro_inst or ''} | {buro_monto or ''}".strip(" |"))
                    if comment:
                        combined_notes.append(f"Comentario SoliPres: {comment}")
                    if notes_reg:
                        combined_notes.append(f"Histórico Notas SoliPres: {notes_reg}")

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

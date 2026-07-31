"""
Unit tests for SoliPres CSV Import Service.
"""
import pytest
from sqlmodel import Session, select

from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.services.import_service import SoliPresCSVImporter


def test_solipres_csv_importer(session: Session):
    csv_sample = (
        "ID,Fecha_y_Hora,Nombre_y_Apellido,Apodo,Cedula,Telefono_Celular,Telefono_Casa,"
        "Telefono_Empresa,Ext_Empresa,Correo_Electronico,Direccion_Vivienda,Provincia_Vivienda,"
        "Casa,Renta_Casa,Tiempo_Sector,Ubicacion,Geolocalizacion,Fecha_Nacimiento,Genero,"
        "Estado_Civil,Nivel_Edu,Nombre_Empresa,Direccion_Empresa,Tipo_Empresa,Cargo,Sueldo,"
        "Tiempo_Laboral,Fecha_Ingreso_Trabajo,Depto_Trabajo,Ocupacion,Horario_Laboral,Jefe_Inmed,"
        "Codigo_Empresa,Banco_Nomina,Monto_Prestamo,Frecuencia_Pago,Plazo,Monto_Cuotas,"
        "Frecuencia_Prestamo,Otros_Ingresos,Posee_Bienes,Referido,Referidopor,Uso_Prestamo,"
        "Cuotas_Conveniente,Tipo_Solicitud,Persona_Dependientes,Grupo_Familiar,Definicion_Familiar,"
        "Nombre_Referencia1,Telefono_Referencia1,Parentesco_Referencia1,Direccion_Referencia1,"
        "Nombre_Referencia2,Telefono_Referencia2,Parentesco_Referencia2,Direccion_Referencia2,"
        "Nombre_Conviviente,Celular_Conviviente,Trabajo_Conviviente,Como_Se_Entero,Comentario_Cliente,"
        "Estatus,Comentario,Asesor_Designado,Asesor_Selec,Respuesta,Tipo_Respuesta,Ced_Repetida,"
        "Solicitud_Leida,Solicitud_Archivada,Solicitud_Promocionada,Solicitud_Promotor,Registro_Notas,"
        "Usuario_Tiempo,Tipo_Historial,Puntuacion_Data,Institucion_Historial,Monto_Historial,Ruta\n"
        "1,2026-07-24 10:00:00,Juan Perez,Juancho,001-0000001-1,8095550001,8095550002,8095550003,101,"
        "juan@example.com,Av Churchill 123,Santo Domingo,Propia,0,5 Anos,Cerca Plaza,,1990-01-01,Masculino,"
        "Soltero,Universitario,Acme Corp,Av Central,Privada,Analista,50000,2 Anos,2024-01-01,Sistemas,"
        "Ingeniero,8am-5pm,Jefe Admin,SP001,BHD,100000,Mensual,12 Meses,9500,Mensual,5000,Vehiculo,No,,"
        "Remodelacion,9500,Personal,2,4,,Pedro Perez,8095550002,Hermano,Piantini,Maria Gomez,8095550003,"
        "Amiga,Naco,Ana Lopez,8095550004,Docente,Google,Solicitud urgente,APROBADA,Excelente buro,Asesor Juan,"
        ",Si,,0,1,0,0,,,,Excelente,750,BHD,100000,\n"
        "2,2026-07-25 14:00:00,Juan Perez,Juancho,001-0000001-1,8095550001,8095550002,8095550003,101,"
        "juan@example.com,Av Churchill 123,Santo Domingo,Propia,0,5 Anos,Cerca Plaza,,1990-01-01,Masculino,"
        "Soltero,Universitario,Acme Corp,Av Central,Privada,Analista,55000,2 Anos,2024-01-01,Sistemas,"
        "Ingeniero,8am-5pm,Jefe Admin,SP001,BHD,150000,Mensual,24 Meses,8000,Mensual,5000,Vehiculo,No,,"
        "Reenganche,8000,Express,2,4,,Pedro Perez,8095550002,Hermano,Piantini,Maria Gomez,8095550003,"
        "Amiga,Naco,Ana Lopez,8095550004,Docente,Google,Nuevo reenganche,RECIBIDA,En evaluacion,Asesor Juan,"
        ",Si,,1,1,0,0,,,,Excelente,750,BHD,100000,\n"
    )

    importer = SoliPresCSVImporter(session)
    report = importer.import_csv_content(csv_sample)

    assert report["processed_rows"] == 2
    assert report["customers_created"] == 1
    assert report["customers_updated"] == 1
    assert report["loan_applications_created"] == 2
    assert len(report["errors"]) == 0

    # Verify Customer in DB
    customer = session.exec(select(Customer).where(Customer.nid == "00100000011")).first()
    assert customer is not None
    assert customer.detail.first_name == "Juan"
    assert customer.detail.last_name == "Perez"
    assert customer.job_info.salary == 55000  # Updated by second row

    # Verify Company creation
    assert customer.company is not None
    assert customer.company.name == "Acme Corp"
    assert customer.company.type == "Privada"
    assert customer.company.rnc == "SP001"

    # Verify Customer Address (Home)
    from app.models.address import Address, Addressable
    from app.models.phone import Phone

    cust_addresses = session.exec(
        select(Address).join(Addressable, Address.id == Addressable.address_id).where(
            Addressable.addressable_type == "Customer",
            Addressable.addressable_id == customer.id
        )
    ).all()
    assert len(cust_addresses) >= 1
    assert cust_addresses[0].street == "Av Churchill 123"
    assert cust_addresses[0].state == "Santo Domingo"

    # Verify Company Address (Work)
    comp_addresses = session.exec(
        select(Address).join(Addressable, Address.id == Addressable.address_id).where(
            Addressable.addressable_type == "Company",
            Addressable.addressable_id == customer.company.id
        )
    ).all()
    assert len(comp_addresses) >= 1
    assert comp_addresses[0].street == "Av Central"

    # Verify Customer Phones
    cust_phones = session.exec(
        select(Phone).where(
            Phone.phoneable_type == "Customer",
            Phone.phoneable_id == customer.id
        )
    ).all()
    assert len(cust_phones) >= 1
    assert any(p.number == "8095550001" for p in cust_phones)

    # Verify 2 Loan Applications tied to 1 single Customer with enriched notes
    apps = session.exec(select(LoanApplication).where(LoanApplication.customer_id == customer.id)).all()
    assert len(apps) == 2
    assert len(apps[0].notes) >= 1
    assert "ID SoliPres original: 1" in apps[0].notes[0].note


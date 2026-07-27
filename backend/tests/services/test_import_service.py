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
        "1,2026-07-24 10:00:00,Juan Perez,Juancho,001-0000001-1,8095550001,,,juan@example.com,"
        "Av Churchill 123,Santo Domingo,Propia,0,5 Anos,,,,,Masculino,Soltero,Universitario,"
        "Acme Corp,Av Central,Privada,Analista,50000,2 Anos,2024-01-01,,,8am-5pm,,SP001,BHD,"
        "100000,Mensual,12 Meses,9500,Mensual,5000,Vehiculo,No,,Remodelacion,,Personal,,,,"
        "Pedro Perez,8095550002,Hermano,Piantini,Maria Gomez,8095550003,Amiga,Naco,,,,"
        "Google,Solicitud urgente,APROBADA,Excelente buró,,,Si,,0,1,0,0,,,Excelente,750,BHD,100000,\n"
        "2,2026-07-25 14:00:00,Juan Perez,Juancho,001-0000001-1,8095550001,,,juan@example.com,"
        "Av Churchill 123,Santo Domingo,Propia,0,5 Anos,,,,,Masculino,Soltero,Universitario,"
        "Acme Corp,Av Central,Privada,Analista,55000,2 Anos,2024-01-01,,,8am-5pm,,SP001,BHD,"
        "150000,Mensual,24 Meses,8000,Mensual,5000,Vehiculo,No,,Reenganche,,Express,,,,"
        "Pedro Perez,8095550002,Hermano,Piantini,Maria Gomez,8095550003,Amiga,Naco,,,,"
        "Google,Nuevo reenganche,RECIBIDA,En evaluacion,,,Si,,1,1,0,0,,,Excelente,750,BHD,100000,\n"
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

    # Verify 2 Loan Applications tied to 1 single Customer
    apps = session.exec(select(LoanApplication).where(LoanApplication.customer_id == customer.id)).all()
    assert len(apps) == 2

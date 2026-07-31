# Fix: Importación Completa de Datos CSV SoliPress a LAMaS

## Descripción del Problema
Al importar solicitudes desde archivos CSV exportados de SoliPress (`solicitud_ID_12_Idequel_bernabel.csv`), la importación funcionaba parcialmente. Sin embargo, diversos datos clave no se guardaban en la base de datos de LAMaS:
1. **Empresa (`Company`):** `Nombre_Empresa`, `Tipo_Empresa`, `Depto_Trabajo`, `Codigo_Empresa` (RNC), la dirección empresarial y el teléfono de empresa eran ignorados.
2. **Dirección de Vivienda (`Address` + `Addressable`):** `Direccion_Vivienda`, `Provincia_Vivienda`, `Ubicacion` y `Tiempo_Sector` no generaban ningún registro `Address` ni su relación `Addressable` para el cliente.
3. **Múltiples Teléfonos (`Phone`):** Solamente se importaba `Telefono_Celular`. `Telefono_Casa`, `Telefono_Empresa` y los teléfonos de las referencias no se registraban.
4. **Referidor por Nombre:** `Referidopor` contenía nombres en texto plano (ej. "Jose el Feo") que al pasar por sanitización de NID se truncaban o borraban.
5. **Notas Enriquecidas (`LoanApplicationNote`):** El ID de SoliPres, asesor asignado, dependientes, grupo familiar e historial del buró de crédito no quedaban archivados en la solicitud.

---

## Causa Raíz
1. `SoliPresCSVImporter` en `backend/app/services/import_service.py` no instanciaba el modelo `Company` ni sus relaciones de dirección laboral y teléfono.
2. El importador ignoraba los campos de dirección de vivienda del CSV sin crear instancias de `Address` ni pivotes `Addressable` (`addressable_type="Customer"`).
3. No se instanciaban teléfonos tipo `"home"` ni `"work"`, ni se asociaban teléfonos a los modelos `CustomerReference`.
4. El mapeo de notas en la solicitud se limitaba únicamente a dos campos (`Comentario` y `Registro_Notas`), omitiendo metadatos auxiliares de la exportación CSV.

---

## Solución Aplicada

### 1. Backend (`backend/app/services/import_service.py`)
- **Actualización de Clientes Existentes (Upsert):** Si el cliente ya existe (coincidencia de NID), se actualizan sus datos personales (`CustomerDetail`), empresa (`Company`), dirección residencial (`Address` tipo `"home"`), información laboral (`CustomerJobInfo`), información financiera (`CustomerFinancialInfo`) y teléfonos (`Phone`) con los datos más recientes del CSV, sin duplicar registros. Siempre se crea una nueva solicitud de préstamo (`LoanApplication`) ligada al cliente.
- **Empresa (`Company`):** Instanciación y actualización de `Company` vinculada al `customer_id` con nombre, tipo, departamento y RNC. Creación/actualización de dirección laboral (`Address` tipo `"work"`) y teléfono de empresa (`Phone` tipo `"work"` con extensión).
- **Dirección del Cliente (`Address` + `Addressable`):** Creación/actualización de `Address` (tipo `"home"`) mapeando `Direccion_Vivienda` a `street` (con desbordamiento a `street2` si excede 255 caracteres), `Provincia_Vivienda` a `state`/`city`, y combinando `Ubicacion` + `Tiempo_Sector` en `references`. Creación del registro pivote `Addressable` (`addressable_type="Customer"`).
- **Múltiples Teléfonos (`Phone`):** Inserción/actualización de `Telefono_Celular` (`type="mobile"`) y `Telefono_Casa` (`type="home"`). Registro de números telefónicos para `CustomerReference` en la tabla `Phone` y sufijados en la dirección de la referencia.
- **Referidores:** Aceptación de nombres de referidores o NIDs de 11 dígitos.
- **Notas Enriquecidas:** Consolidación de `ID SoliPres original`, `Tipo Solicitud`, `Asesor Designado`, `Cuotas Sugerida/Conveniente`, `Carga Familiar` e `Histórico/Buró SoliPres` dentro de `LoanApplicationNote`.

### 2. Pruebas Unitarias (`backend/tests/services/test_import_service.py`)
- Actualización de las columnas del CSV sintético para coincidir 1:1 con el orden de las 80 columnas de SoliPress.
- Adición de aserciones para verificar `Company`, dirección del cliente, dirección laboral, teléfonos y notas enriquecidas.

---

## Archivos Modificados
- `backend/app/services/import_service.py`
- `backend/tests/services/test_import_service.py`
- `docs/README.md`
- `docs/fixes/fix_2026_07_31_solipres_csv_full_data_import.md`

---

## Verificación Ejecutada
```bash
# Execute pytest via uv in backend directory
cd backend && uv run pytest tests/services/test_import_service.py -v
```
**Resultado:** `1 passed in 0.40s`.

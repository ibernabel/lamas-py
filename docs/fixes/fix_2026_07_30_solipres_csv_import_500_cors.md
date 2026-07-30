# Fix: Corrección de Importación CSV SoliPres (Duplicación de Ruta API, Savepoints y CORS)

## Fecha
2026-07-30

## Síntoma
1. **Error 404 (Not Found):** Al intentar importar solicitudes desde el modal `ImportCsvModal` en `http://localhost:3000/loans`, la consola del navegador reportó un error 404 a la URL `POST http://127.0.0.1:8001/api/v1/api/v1/loan-applications/import-csv`.
2. **Error 500 (Internal Server Error) & Bloqueo CORS:** Tras corregir la URL, el modal mostró el mensaje *"Error al procesar el archivo CSV de SoliPres"*, y la consola del navegador mostró un error `500 (Internal Server Error)` acompañado del mensaje:
   `Access to XMLHttpRequest at 'http://127.0.0.1:8001/api/v1/loan-applications/import-csv' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

## Causa Raíz

1. **Duplicación de Ruta API en Frontend:**
   - El cliente Axios (`frontend/lib/api/client.ts`) tiene configurada su `baseURL` apuntando a `NEXT_PUBLIC_API_URL` (`http://127.0.0.1:8001/api/v1`).
   - En `frontend/lib/api/import.ts`, la función `importSoliPresCSV` enviaba la petición a `/api/v1/loan-applications/import-csv`, lo que hizo que Axios concatenara ambas partes produciendo `/api/v1/api/v1/...`.

2. **Ausencia de Savepoints y Violación de Restricciones en Backend:**
   - En `app/services/import_service.py`, las inserciones y flushes de base de datos dentro del bucle de procesamiento de filas CSV se ejecutaban directamente sobre la sesión principal de SQLAlchemy.
   - Si una sola fila contenía un valor que excedía la longitud máxima de la columna en la BD (por ejemplo, un nombre en `referred_by` cuyo límite es `max_length=11` en `Customer`), SQLAlchemy arrojaba una excepción en el `session.flush()`.
   - Sin el uso de *savepoints* (`session.begin_nested()`), la sesión de SQLAlchemy quedaba en estado `PendingRollbackError`. Las filas posteriores fallaban en cascada y la función provocaba una excepción no capturada al nivel del servidor (500).

3. **Inexistencia de Cabeceras CORS en Excepciones No Capturadas (500):**
   - Cuando FastAPI/Uvicorn sufre un error 500 no capturado a nivel de endpoint, la respuesta por defecto de Starlette no aplica el middleware de CORS, provocando que el navegador bloquee la respuesta por falta de la cabecera `Access-Control-Allow-Origin`.

## Solución Aplicada

1. **Corrección de Rutas en Frontend:**
   - **[import.ts](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/lib/api/import.ts)**: Se removió el prefijo `/api/v1` dejando la ruta como `/loan-applications/import-csv`.
   - **[solicitar/page.tsx](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/app/%28public%29/solicitar/page.tsx)**: Se ajustó la ruta a `/loan-applications/submit`.
   - **[identification-step.tsx](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/components/public-form/steps/identification-step.tsx)**: Se ajustó la ruta a `/nid-validation/${cleaned}`.

2. **Savepoints y Truncamiento de Datos en Backend:**
   - **[import_service.py](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/services/import_service.py)**:
     - Se introdujo `with self.session.begin_nested():` por cada fila del bucle CSV. Si una fila falla, SQLAlchemy revierte únicamente ese *savepoint*, manteniendo la transacción principal sana para continuar con las demás filas.
     - Se agregaron truncamientos de cadena basados en el esquema de BD: `referred_by[:11]`, `first_name[:255]`, `last_name[:255]`, `frequency[:50]`, `telefono_celular[:50]`, etc.
     - Se ampliaron los formatos de parseo en `parse_date` y `parse_datetime` (`%d/%m/%Y`, `%Y/%m/%d`, etc.).

3. **Manejo Estructurado de Excepciones en Endpoint:**
   - **[import_csv.py](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/import_csv.py)**: Se envolvió la ejecución del importador en un bloque `try-except` que captura cualquier error no esperado y lanza un `HTTPException(400)`, garantizando respuestas JSON con cabeceras CORS en caso de fallos.

## Archivos Modificados
- `frontend/lib/api/import.ts`
- `frontend/app/(public)/solicitar/page.tsx`
- `frontend/components/public-form/steps/identification-step.tsx`
- `backend/app/services/import_service.py`
- `backend/app/api/v1/endpoints/import_csv.py`

## Verificación
- Carga e importación del archivo CSV de prueba (`solicitudes_completas_2026-07-27_182616.csv`).
- Resultado confirmado en la interfaz:
  - 11 registros procesados exitosamente.
  - 10 clientes nuevos creados.
  - 1 cliente desduplicado/actualizado.
  - 11 solicitudes de préstamos registradas.

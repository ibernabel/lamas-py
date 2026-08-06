# PresternativaSync: integración vía archivo Excel/DOCX, no vía conexión a base de datos

La sincronización de datos de Presterativa a FRM se realiza mediante importación de archivos exportados manualmente desde Presterativa, no mediante conexión directa a su base de datos.

Presterativa genera dos tipos de exportaciones:
1. **Excel bulk**: Archivo con el estado actual y datos de todos los clientes. Es el mecanismo de sincronización periódica del portafolio completo.
2. **DOCX individual**: Historial de pagos por cliente. Formato Word, difícil de parsear programáticamente.

El formato exacto de ambos archivos está en fase de exploración y análisis. No hay schema definido aún.

## Considered Options

- **Conexión directa a la BD de Presterativa**: Técnicamente posible (Presterativa usa una BD en Windows). Descartado por: (a) el formato de exportación aún no está validado, (b) requiere acceso de red persistente al servidor Windows, (c) acoplamiento directo a internals de Presterativa.
- **Archivo Excel/DOCX (elegido)**: Más agnóstico al mecanismo de almacenamiento de Presterativa. La conexión a BD puede evaluarse en el futuro una vez que los formatos y datos estén claros.

## Consequences

- FRM necesita un `PresternativaSync` service capaz de parsear Excel (con `openpyxl` o `pandas`) y eventualmente DOCX (con `python-docx`).
- El matching de clientes entre el archivo Excel y los `Customer` en FRM se hace por **NID** (cédula), que es el identificador único en ambos sistemas.
- El DOCX de historial de pagos es un formato frágil para parseo automático. Se debe evaluar si Presterativa puede exportar ese historial en Excel/CSV antes de invertir en un parser DOCX.
- El proceso de import es **manual en primera iteración**: un administrador sube el archivo Excel al FRM, que lo procesa en background. La automatización (scheduled job, file watcher) es trabajo futuro.
- El esquema de columnas del Excel de Presterativa debe documentarse como `docs/decisions/` o `docs/knowledges/` una vez que esté disponible.

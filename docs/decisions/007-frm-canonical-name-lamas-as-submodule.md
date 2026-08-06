# FRM es el nombre canónico del sistema; LAMaS es el submódulo de origination

El proyecto fue creado como LAMaS (Loan Applications Management System) para gestionar solicitudes de préstamo, y evolucionó conceptualmente hacia un sistema más amplio de gestión de relaciones financieras con el cliente. El nombre FRM (Financial Relationship Management) refleja esa visión completa.

LAMaS pasa a ser el nombre del submódulo de origination dentro del FRM. El repo puede renombrarse en el futuro a `frm-core` o equivalente.

## Considered Options

- **Mantener LAMaS como nombre del sistema completo**: Descartado porque el nombre implica un alcance limitado (solo solicitudes de préstamo) que contradice la visión de repositorio central del universo de datos del cliente.
- **Crear un repo nuevo para FRM y dejar LAMaS como está**: Descartado por el costo de migración y duplicación; el código existente es una base válida.

## Consequences

- La documentación, ROADMAP y README deben actualizarse para reflejar FRM como nombre del sistema.
- Los términos "LAMaS" en el código (variables, comentarios, rutas) no requieren renombrado inmediato — se migran gradualmente.
- El repo se puede renombrar cuando el equipo lo considere oportuno; no es urgente.

# CustomerFinancialStatus: enum de estados financieros del cliente derivado de Presterativa

El campo `financial_status` en el perfil del Customer representa el estado financiero actual derivado de los datos sincronizados desde Presterativa. Se actualiza via `PresternativaSync`.

## Enum definido

| Valor | Descripción |
|---|---|
| `UNKNOWN` | Sin datos de Presterativa disponibles (estado inicial por defecto) |
| `NO_ACTIVE_LOAN` | No tiene préstamo activo en Presterativa |
| `CURRENT` | Préstamo activo, pagos al día |
| `IN_MORA` | Préstamo activo, con pagos atrasados |
| `MORA_RESOLVED` | Estaba en mora, ya regularizó |
| `IN_LEGAL` | Préstamo siendo gestionado vía proceso legal |
| `CHARGED_OFF` | Préstamo castigado (write-off contable) |
| `CLOSED` | Préstamo cerrado/cancelado normalmente |

## Consequences

- Este campo se almacena en una tabla dedicada `customer_financial_snapshots` (historial) y se proyecta como campo de lectura rápida en `Customer` o `CustomerShadowRisk`.
- Los estados `IN_LEGAL` y `CHARGED_OFF` deben activar un bloqueo automático de nuevas solicitudes en el FRM (regla de pre-filtro, sin llamar a CreditGraph).
- El estado `IN_MORA` activa revisión manual obligatoria en lugar de auto-aprobación.
- El estado `UNKNOWN` no bloquea por defecto — el sistema no puede penalizar a clientes por ausencia de datos.

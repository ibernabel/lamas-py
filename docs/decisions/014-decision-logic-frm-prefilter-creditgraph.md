# Lógica de decisión dividida: FRM pre-filtro + CreditGraph análisis profundo

Las decisiones sobre solicitudes de crédito y gestión de clientes se toman en dos capas:

1. **FRM pre-filtro** (reglas de negocio simples, sin latencia): Ejecutado en `lamas` antes de llamar a CreditGraph. Bloquea o escala solicitudes basándose en condiciones objetivas configurables.
2. **CreditGraph** (análisis profundo): Se invoca solo cuando el pre-filtro no bloquea. Evalúa riesgo crediticio completo (IRS Score, OSINT, análisis financiero).

## Reglas de pre-filtro en FRM (ejemplos iniciales)

| Condición | Acción automática | Sin llamar a CreditGraph |
|---|---|---|
| `financial_status = IN_LEGAL` | Bloquear solicitud | ✅ |
| `financial_status = CHARGED_OFF` | Bloquear solicitud | ✅ |
| `financial_status = IN_MORA` | Forzar `MANUAL_REVIEW` | ✅ |
| NID inválido (falla validación JCE) | Bloquear solicitud | ✅ |
| Solicitud duplicada activa | Bloquear solicitud | ✅ |
| Monto > 50,000 DOP | Forzar `MANUAL_REVIEW` | ✅ (regla de negocio) |

Las reglas de pre-filtro se configuran via `SystemConfig` en base de datos — no hardcodeadas — para permitir ajuste sin deploy.

## Consequences

- CreditGraph no recibe llamadas innecesarias, reduciendo costo y latencia.
- El pre-filtro corre sincrónicamente en el endpoint de evaluación de FRM.
- Las reglas de pre-filtro deben documentarse en `SystemConfig` como entidad administrable.
- CreditGraph sigue siendo la fuente de verdad para el IRS Score y la decisión crediticia profunda — el pre-filtro solo bloquea casos obvios.

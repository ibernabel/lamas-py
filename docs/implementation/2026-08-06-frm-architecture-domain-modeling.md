# Sesión de Arquitectura FRM: Dominio, Visión y Hoja de Ruta

**Fecha**: 2026-08-06
**Tipo**: Sesión de diseño y modelado de dominio (grill-with-docs)
**Workflow**: `/grill-with-docs` → `/grilling` + `/domain-modeling`

---

## Objetivo

Establecer una visión arquitectónica clara del sistema FRM (Financial Relationship Management), resolver ambigüedades de dominio acumuladas desde el inicio del proyecto, y generar documentación formal que sirva como fuente única de verdad.

---

## Componentes Creados

### Glosario Canónico
- **`CONTEXT.md`** (raíz del repo): Glosario de 20+ términos canónicos del dominio FRM. Incluye: FRM, LAMaS, Presterativa, CreditGraph, Customer, Tenant, Cooperativa, Financiera, Socio, Convenio, CoreTask, PresternativaSync, CustomerFinancialStatus, PreFilter, frm-contracts, WhatsApp Business, Chatwoot, y más.

### Documento Maestro de Arquitectura
- **`docs/planning/frm-architecture.md`**: Documento central del sistema FRM con:
  - Visión y principios de diseño
  - Estructura del monorepo `frm-system`
  - Diagrama de las tres capas (Conversacional, MDM, Analítica)
  - Modelo de datos completo (existente + objetivo)
  - Mapa de vistas y capacidades de la UI
  - Integración CreditGraph (actual + enriquecida)
  - Integración Presterativa (HITL + PresternativaSync)
  - Capa conversacional (parser WhatsApp)
  - Hoja de ruta reorganizada por ejes

### Architecture Decision Records (ADRs)
- **ADR-007**: FRM es el nombre canónico del sistema; LAMaS es el submódulo de origination
- **ADR-008**: Presterativa es el Core; integración FRM↔Core es HITL manual, no automatizada
- **ADR-009**: Multi-tenancy por tipo de tenant: Cooperativa vs Financiera
- **ADR-010**: Despliegue single-tenant: una instancia del FRM por cliente
- **ADR-011**: Monorepo `frm-system` (Python + TypeScript, apps/ + packages/)
- **ADR-012**: PresternativaSync vía archivos Excel bulk + DOCX individual (no DB directa)
- **ADR-013**: CustomerFinancialStatus enum con 8 estados incluyendo IN_LEGAL y CHARGED_OFF
- **ADR-014**: Lógica de decisión dividida: PreFilter en FRM + CreditGraph para análisis profundo
- **ADR-015**: Parser WhatsApp dual-format Android/iOS + regex PII sanitization

---

## Decisiones Clave Tomadas

| Decisión | Impacto |
|---|---|
| FRM reemplaza a LAMaS como nombre del sistema | Todas las docs y README futuras usan FRM |
| Single-tenant por instancia | Elimina `tenant_id` del schema; simplifica RLS |
| Monorepo `frm-system` | Un repo, un docker-compose, un CI/CD pipeline |
| Presterativa: sin API, HITL manual | CoreTaskQueue es checklist operativo, no integration bus |
| PresternativaSync: Excel parsing | openpyxl; DOCX en backlog; matching por NID |
| PreFilter antes de CreditGraph | Reduce llamadas al motor AI; reglas en `prefilter_rules` tabla |
| CustomerFinancialStatus | 8 estados; IN_LEGAL y CHARGED_OFF bloquean automáticamente |
| WhatsApp parser dual-format | Soporte Android ([DD/MM/AA HH:MM:SS]) e iOS (DD/MM/AA, HH:MM) |

---

## Modelo de Datos — Resumen de Brechas

### Tablas nuevas a crear
1. `audit_logs` (Fase 10 — aprobada)
2. `customer_lifecycle_events` (nuevo — crítico FRM)
3. `customer_financial_snapshots` (nuevo — PresternativaSync)
4. `conversation_threads` (nuevo — capa conversacional)
5. `whatsapp_import_batches` (nuevo — tracking de importaciones)
6. `prefilter_rules` (nuevo — PreFilter configurable)

### Tablas a completar
- `cooperative_profiles`: añadir `join_date`, `monthly_contribution`, Relationship
- `loan_applications`: añadir `collateral_type`, `analyzed_at`
- `customers`: añadir campo `financial_status` de lectura rápida
- `conversational_logs`: añadir `thread_id`, `message_type`, `metadata_json`

### Modelos existentes sin endpoint/UI (a conectar)
- `cooperative_profiles` → necesita API + UI en `/customers/[id]/cooperative`
- `customer_shadow_risks` → necesita API + UI en `/customers/[id]/risk`
- `legal_consents` → necesita endpoint + integración en wizard
- `core_task_queues` → necesita UI en `/tasks`

---

## Hoja de Ruta Reorganizada

La hoja de ruta fue reorganizada desde "fases de migración" a "ejes de construcción del FRM":

- **Eje 0**: Deuda técnica (Fases 11, 13, modelos huérfanos)
- **Eje 1**: Cimentar FRM (Fase 10, lifecycle events, shadow risk, HITL UI, dashboard, PreFilter)
- **Eje 2**: PresternativaSync (investigar Excel → parser → snapshots → lifecycle auto)
- **Eje 3**: Capa conversacional (frm-chats, parser WhatsApp, Thread Viewer)
- **Eje 4**: Monorepo & CI/CD (frm-system, frm-contracts, deploy producción)
- **Eje 5**: Analítica avanzada (portafolio, reportes, alertas, CreditGraph enriquecido)

---

## Verificación

No hubo cambios en código de aplicación en esta sesión — fue una sesión de diseño y documentación.

Archivos creados (untracked en git):
- `CONTEXT.md`
- `docs/planning/frm-architecture.md`
- `docs/decisions/007-frm-canonical-name-lamas-as-submodule.md`
- `docs/decisions/008-presterativa-core-hitl-manual-integration.md`
- `docs/decisions/009-tenant-type-cooperativa-vs-financiera.md`
- `docs/decisions/010-single-tenant-deployment.md`
- `docs/decisions/011-monorepo-frm-system.md`
- `docs/decisions/012-presterativa-sync-file-based-import.md`
- `docs/decisions/013-customer-financial-status-enum.md`
- `docs/decisions/014-decision-logic-frm-prefilter-creditgraph.md`
- `docs/decisions/015-whatsapp-parser-multi-format.md`
- `docs/implementation/2026-08-06-frm-architecture-domain-modeling.md` (este archivo)

---

## Commit sugerido

```
docs: establish FRM vision, domain model, and architecture blueprint

- Create CONTEXT.md with canonical domain glossary (20+ terms)
- Create docs/planning/frm-architecture.md as master architecture SSOT
- Add ADR-007 through ADR-015 covering all major design decisions:
  * FRM as system name, LAMaS as origination submodule
  * Presterativa HITL-manual integration pattern
  * Single-tenant deployment (no tenant_id in schema)
  * Monorepo frm-system structure (Python + TypeScript)
  * PresternativaSync via Excel file import
  * CustomerFinancialStatus 8-state enum
  * PreFilter + CreditGraph split decision logic
  * WhatsApp dual-format parser (Android/iOS)
```

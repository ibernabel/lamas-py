# FRM — Financial Relationship Management
## Documento Maestro de Arquitectura

> **Estado**: Documento vivo — Fuente Única de Verdad (SSOT) de arquitectura
> **Versión**: 1.0 — 2026-08-06
> **Decisiones de respaldo**: ADR-007 al ADR-015 en `docs/decisions/`
> **Glosario canónico**: `CONTEXT.md` en la raíz del repositorio

---

## 1. Visión del Sistema

El **FRM** (Financial Relationship Management) es el repositorio central del universo de datos del cliente financiero. No es un gestor de solicitudes de préstamo — es el sistema que:

- **Conoce** al cliente en todas sus dimensiones: demográfica, laboral, financiera, conductual y relacional.
- **Conversa** con el cliente a través de múltiples canales (WhatsApp Business, email, formulario público).
- **Analiza** el ciclo de vida completo del cliente y determina su riesgo crediticio.
- **Actúa** coordinando con el sistema core Presterativa vía flujo HITL.

### Principios de diseño

| Principio | Expresión concreta |
|---|---|
| **SSOT** | Un solo Customer en FRM por NID. Un solo lugar donde vive su historial. |
| **Zero-PII** | Ningún dato de identificación personal se envía a servicios externos. |
| **Single-tenant** | Una instancia del FRM por cliente (Cooperativa o Financiera). Sin `tenant_id` en el schema. |
| **HITL-first** | La sincronización con Presterativa es manual. FRM genera la tarea; el humano la ejecuta. |
| **PreFilter antes de IA** | Las reglas de negocio simples corren en FRM. CreditGraph solo se invoca cuando aplica. |

---

## 2. Estructura del Sistema — Monorepo `frm-system`

> **ADR-011**: El sistema completo vive en un monorepo mixto Python + TypeScript.

```
frm-system/
├── apps/
│   ├── lamas/                  ← Backend FastAPI
│   │   ├── app/
│   │   │   ├── api/v1/         ← Endpoints REST
│   │   │   ├── models/         ← SQLModel (tablas PostgreSQL)
│   │   │   ├── services/       ← Lógica de negocio
│   │   │   └── core/           ← Config, seguridad, DB
│   │   └── pyproject.toml
│   │
│   ├── lamas-web/              ← Frontend Next.js 16 + Tailwind 4 + shadcn/ui
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/    ← customers, loans, tasks, conversations, analytics
│   │   │   └── (public)/       ← /solicitar (formulario público Zero-PII)
│   │   └── package.json
│   │
│   ├── creditgraph/            ← Motor de scoring crediticio (headless, stateless)
│   │
│   └── frm-chats/              ← Capa conversacional (nuevo)
│       ├── parser/             ← WhatsApp .txt parser (Android + iOS)
│       ├── sanitizer/          ← PII removal (regex-based)
│       ├── matcher/            ← Customer matching por nombre (fuzzy)
│       └── api/                ← Endpoints de importación
│
├── packages/
│   └── frm-contracts/          ← Tipos y contratos compartidos
│       ├── python/             ← Pydantic schemas compartidos
│       └── typescript/         ← TypeScript interfaces compartidas
│
├── docker-compose.yml          ← Orquestación completa del sistema
├── Makefile
└── CONTEXT.md                  ← Glosario canónico del dominio
```

### Servicios en docker-compose.yml

| Servicio | Puerto | Descripción |
|---|---|---|
| `lamas-api` | 8001 | Backend FastAPI |
| `lamas-web` | 3000 | Frontend Next.js |
| `creditgraph` | 8002 | Motor CreditGraph |
| `frm-chats` | 8003 | API capa conversacional |
| `postgres` | 5433 | PostgreSQL 15 |
| `redis` | 6379 | Queue/cache (futuro) |

---

## 3. Las Tres Capas del FRM

```
┌──────────────────────────────────────────────────────────────────────┐
│                   CAPA 3: ANALÍTICA Y CICLO DE VIDA                  │
│   Dashboard KPIs · Portafolio · HITL Queue · Alertas · Reportes      │
├──────────────────────────────────────────────────────────────────────┤
│              CAPA 2: DATOS MULTIDIMENSIONALES (MDM)                  │
│   Customer 360° · CooperativeProfile · Audit · ShadowRisk · Docs     │
├──────────────────────────────────────────────────────────────────────┤
│                    CAPA 1: CONVERSACIONAL                            │
│   WhatsApp Import · Thread Viewer · PII Sanitizer · Templates        │
└──────────────────────────────────────────────────────────────────────┘
              ↕ REST API (frm-contracts)
┌──────────────────────────────────────────────────────────────────────┐
│                    CreditGraph AI (apps/creditgraph)                 │
│   PreFilter (FRM) → IRS Score · OSINT · Shadow Risk · Narrativa ES   │
└──────────────────────────────────────────────────────────────────────┘
              ↕ HITL Manual (CoreTaskQueue)
┌──────────────────────────────────────────────────────────────────────┐
│                   PRESTERATIVA (Core externo)                        │
│   Préstamos activos · Cobro · Mora · Disbursamiento                  │
│   PresternativaSync ← Excel bulk (periódico) + DOCX individual       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Datos Completo

### 4.1 Estado actual de cada tabla

| Tabla | Estado | Notas |
|---|---|---|
| `customers` | ✅ Completo | NID único; falta: `financial_status` field |
| `customer_details` | ✅ Completo | Demográfico, housing, transport |
| `customer_financial_info` | ✅ Completo | Ingresos, deudas, gastos |
| `customer_job_info` | ✅ Completo | Empleo, salario, banco de pago |
| `customer_references` | ✅ Completo | Referencias personales |
| `customer_vehicles` | ✅ Completo | Vehículo del cliente |
| `customers_accounts` | ✅ Completo | Cuentas bancarias |
| `companies` | ✅ Completo | Empresa empleadora + Convenios |
| `phones` | ✅ Completo | Polimórfico |
| `addresses` / `addressables` | ✅ Completo | Polimórfico ManyToMany |
| `loan_applications` | ⚠️ Parcial | Falta: `collateral_type`, `analyzed_at` (Fase 13) |
| `loan_application_details` | ✅ Completo | Monto, plazo, cuota, frecuencia |
| `loan_application_notes` | ✅ Completo | Notas del analista |
| `creditgraph_analyses` | ✅ Completo | Respuesta completa + shadow_risk_score |
| `customer_documents` | ✅ Completo | 14 tipos, versioning, local/R2 |
| `legal_consents` | ⚠️ Sin endpoint/UI | Ley 172-13 RD — modelo existe |
| `portfolios` | ✅ Completo | Carteras por broker |
| `brokers` | ✅ Completo | FK a users |
| `promoters` | ✅ Completo | Con bonos y datos bancarios |
| `credit_risks` / `categories` | ✅ Completo | Catálogo de riesgos |
| `system_configs` | ✅ Existe | tenant_type + PreFilter rules config |
| `system_integration_maps` | ✅ Existe | Mapeo Customer ↔ Presterativa/WhatsApp IDs |
| `users` | ✅ Completo | JWT, roles básicos |
| `cooperative_profiles` | ⚠️ Incompleto | Falta: `join_date`, `monthly_contribution`, Relationship |
| `customer_shadow_risks` | ⚠️ Sin endpoint/UI | DTI, biometría, device fingerprint |
| `conversational_logs` | ⚠️ Esqueleto | Sin pipeline, sin API |
| `core_task_queues` | ⚠️ Sin UI | HITL tasks para Presterativa |

### 4.2 Tablas nuevas requeridas

#### `audit_logs` — (Fase 10, aprobada)
```sql
id                UUID PRIMARY KEY
table_name        VARCHAR(100)     -- 'customers', 'loan_applications'
record_id         VARCHAR(50)
action            ENUM('INSERT','UPDATE','DELETE')
old_values        JSONB
new_values        JSONB
actor_id          INT REFERENCES users(id)   -- nullable (proceso automático)
actor_ip          VARCHAR(45)
source            ENUM('INTERNAL','PUBLIC_FORM','CSV_IMPORT','PRESTERATIVA_SYNC','API')
created_at        TIMESTAMP NOT NULL
-- RLS: solo INSERT permitido. Sin UPDATE ni DELETE.
```

#### `customer_lifecycle_events` — (nuevo, crítico para FRM)
```sql
id                SERIAL PRIMARY KEY
customer_id       INT REFERENCES customers(id)
event_type        ENUM(
                    'FIRST_CONTACT','APPLICATION_SUBMITTED','APPLICATION_APPROVED',
                    'APPLICATION_REJECTED','LOAN_DISBURSED','FIRST_PAYMENT',
                    'IN_MORA','MORA_RESOLVED','IN_LEGAL','CHARGED_OFF',
                    'LOAN_CLOSED','REACTIVATED','CHURNED'
                  )
event_date        DATE
metadata_json     JSONB    -- monto, días mora, canal, etc.
triggered_by      ENUM('SYSTEM','USER','PRESTERATIVA_SYNC')
user_id           INT REFERENCES users(id)   -- nullable
created_at        TIMESTAMP
```

#### `customer_financial_snapshots` — (nuevo, para PresternativaSync)
```sql
id                    SERIAL PRIMARY KEY
customer_id           INT REFERENCES customers(id)
snapshot_date         DATE             -- fecha del Excel importado
financial_status      ENUM('UNKNOWN','NO_ACTIVE_LOAN','CURRENT','IN_MORA',
                           'MORA_RESOLVED','IN_LEGAL','CHARGED_OFF','CLOSED')
outstanding_balance   FLOAT
days_in_mora          INT
next_payment_date     DATE
raw_data_json         JSONB            -- fila completa del Excel, para auditoría
presterativa_id       VARCHAR(50)      -- via system_integration_maps
imported_at           TIMESTAMP
```

#### `conversation_threads` — (nuevo)
```sql
id                SERIAL PRIMARY KEY
customer_id       INT REFERENCES customers(id)
channel           ENUM('WHATSAPP_MANUAL','WHATSAPP_API','EMAIL','INTERNAL')
status            ENUM('OPEN','RESOLVED','ESCALATED')
started_at        TIMESTAMP
last_message_at   TIMESTAMP
assigned_to       INT REFERENCES users(id)   -- nullable
```

#### `whatsapp_import_batches` — (nuevo)
```sql
id                    SERIAL PRIMARY KEY
filename              VARCHAR(255)
imported_by           INT REFERENCES users(id)
format_detected       ENUM('ANDROID','IOS','UNKNOWN')
messages_parsed       INT
messages_stored       INT
customers_matched     INT
customers_unmatched   INT
pii_hits_removed      INT
status                ENUM('PENDING','PROCESSING','COMPLETED','FAILED')
error_log             JSONB
imported_at           TIMESTAMP
```

#### `prefilter_rules` — (nuevo, configurable sin deploy)
```sql
id                SERIAL PRIMARY KEY
rule_name         VARCHAR(100)
condition_field   VARCHAR(100)   -- 'financial_status','loan_amount','nid_valid'
condition_op      ENUM('EQ','GT','LT','IN','NOT_IN')
condition_value   VARCHAR(255)
action            ENUM('BLOCK','FORCE_MANUAL_REVIEW','ALLOW')
is_active         BOOLEAN
priority          INT
created_at        TIMESTAMP
```

### 4.3 Modificaciones a tablas existentes

| Tabla | Campos a añadir |
|---|---|
| `customers` | `financial_status ENUM(CustomerFinancialStatus)` — lectura rápida, actualizada por sync |
| `cooperative_profiles` | `join_date DATE`, `monthly_contribution FLOAT`, Relationship → Customer |
| `loan_applications` | `collateral_type VARCHAR(50)`, `analyzed_at TIMESTAMP` |
| `conversational_logs` | `thread_id FK`, `message_type ENUM(TEXT,MEDIA,SYSTEM)`, `metadata_json JSONB` |

---

## 5. Mapa de Vistas y Capacidades

### 5.1 Rutas existentes

| Ruta | Estado |
|---|---|
| `/login` | ✅ |
| `/` (dashboard) | ✅ Stub — sin KPIs reales |
| `/customers` | ✅ |
| `/customers/new` | ✅ |
| `/customers/[id]` | ✅ Multipestañas |
| `/customers/[id]/edit` | ✅ |
| `/loans` | ✅ |
| `/loans/new` | ✅ |
| `/loans/[id]` | ✅ |
| `/loans/[id]/analysis` | ✅ Dashboard CreditGraph |
| `/solicitar` | ✅ Wizard público Zero-PII |
| `/settings` | ✅ Idioma, tema |

### 5.2 Rutas faltantes — Capa 1 (Conversacional)

| Ruta | Prioridad | Descripción |
|---|---|---|
| `/conversations` | 🔴 | Vista global de hilos |
| `/conversations/import` | 🔴 | Importador .txt WhatsApp |
| `/conversations/import/[batch_id]` | 🟡 | Revisión y confirmación de matches |
| `/customers/[id]/conversations` | 🔴 | Timeline de mensajes por cliente |

### 5.3 Rutas faltantes — Capa 2 (MDM)

| Ruta | Prioridad | Descripción |
|---|---|---|
| `/customers/[id]/lifecycle` | 🔴 | Timeline CustomerLifecycleEvents |
| `/customers/[id]/risk` | 🔴 | Shadow Risk + CustomerFinancialStatus |
| `/customers/[id]/cooperative` | 🟡 | CooperativeProfile (Socio) |
| `/audit` | 🟡 | AuditLog por entidad (solo admin) |

### 5.4 Rutas faltantes — Capa 3 (Analítica)

| Ruta | Prioridad | Descripción |
|---|---|---|
| `/` (dashboard real) | 🔴 | KPIs: solicitudes, mora, IRS distribution |
| `/tasks` | 🔴 | HITL Queue — tareas para Presterativa |
| `/portfolios` | 🟡 | Análisis por cartera |
| `/reports` | 🟡 | PDF/CSV: portafolio, mora |
| `/presterativa/sync` | 🟡 | Upload Excel + resultados del sync |

---

## 6. Integración CreditGraph

### 6.1 PreFilter antes de CreditGraph

```
Nueva LoanApplication
        │
        ▼
┌───────────────────────────────────┐
│         PreFilter FRM             │  ← prefilter_rules (configurable en DB)
│                                   │
│  IN_LEGAL / CHARGED_OFF      ────►  BLOQUEADO ❌
│  IN_MORA                     ────►  MANUAL_REVIEW 🟡
│  NID inválido (JCE Módulo 10)────►  BLOQUEADO ❌
│  Monto > 50,000 DOP          ────►  MANUAL_REVIEW 🟡
│  Solicitud activa duplicada  ────►  BLOQUEADO ❌
│  OK                          ────►  CreditGraph ►
└───────────────────────────────────┘
```

### 6.2 Payload enriquecido (fase futura)

Cuando `PresternativaSync` esté operativo, el payload a CreditGraph incluirá:

```python
{
    # Actuales (Zero-PII)
    "applicant_hash": "sha256(NID)",
    "declared_salary": 45000,
    # ...

    # Nuevos: historial interno FRM (cuando disponible)
    "loan_history_summary": {
        "total_loans": 2,
        "completed_on_time": 2,
        "max_days_in_mora": 0
    },
    "customer_stage": "RETURNING",   # NEW | RETURNING | AT_RISK | CHURNED
    "days_since_last_loan_closed": 180,

    # Nuevos: señales conversacionales (cuando disponible)
    "conversation_signals": {
        "avg_sentiment": 0.78,
        "response_latency_hours": 1.5
    }
}
```

---

## 7. Integración Presterativa

### 7.1 CustomerFinancialStatus

| Estado | Código | Bloquea | Acción PreFilter |
|---|---|---|---|
| Sin datos | `UNKNOWN` | No | Permite (con advertencia) |
| Sin préstamo | `NO_ACTIVE_LOAN` | No | Permite |
| Al día | `CURRENT` | No | → CreditGraph |
| En mora | `IN_MORA` | Parcial | Fuerza MANUAL_REVIEW |
| Mora resuelta | `MORA_RESOLVED` | No | → CreditGraph |
| En proceso legal | `IN_LEGAL` | Sí | BLOQUEADO |
| Castigado | `CHARGED_OFF` | Sí | BLOQUEADO |
| Cerrado | `CLOSED` | No | → CreditGraph |

### 7.2 Flujo CoreTaskQueue (HITL)

```
FRM aprueba LoanApplication
        │
        ▼
CoreTask → task_type: CREATE_LOAN_IN_CORE
payload: { amount, term, rate, customer_presterativa_id }
        │
        ▼
Operador en /tasks:
  1. Lee la CoreTask
  2. Va a Presterativa manualmente
  3. Crea el préstamo
  4. Anota el ID de Presterativa
  5. Marca COMPLETED en FRM + core_reference_id
        │
        ▼
FRM actualiza:
  - system_integration_maps
  - CustomerLifecycleEvent: LOAN_DISBURSED
  - LoanApplication.status: DISBURSED
```

---

## 8. Capa Conversacional — frm-chats

### 8.1 Formatos de export WhatsApp soportados

| SO | Formato |
|---|---|
| Android | `[DD/MM/AA HH:MM:SS] Nombre: Mensaje` |
| iPhone/iOS | `DD/MM/AA, HH:MM - Nombre: Mensaje` |

### 8.2 Reglas de sanitización PII

| Patrón | Reemplazo |
|---|---|
| NID `000-0000000-0` | `[NID-REDACTED]` |
| Teléfonos | `[TEL-REDACTED]` |
| Emails | `[EMAIL-REDACTED]` |
| Multimedia | `<Archivo adjunto: nombre.ext>` → metadata |
| Multi-línea | Concatenado al mensaje anterior |
| Mensajes de sistema | Tipo `SYSTEM`, descartados |

---

## 9. Hoja de Ruta

### Eje 0 — Deuda técnica (ahora)
- D-01: Fase 11 Enum Audit — errores 422 wizard público (1-2 días)
- D-02: Fase 13 Document Upload UX Redesign (3-4 días)
- D-03: Completar `CooperativeProfile` (join_date, monthly_contribution) (< 1 día)
- D-04: Exponer `LegalConsent` vía API + UI (1-2 días)
- D-05: Resolver Known Issue document viewer 404 (< 1 día)

### Eje 1 — Cimentar el FRM (Sprint 1)
- F1-01: Fase 10 AuditLog completo (2 semanas)
- F1-02: `customer_lifecycle_events` + API + Timeline UI (1 semana)
- F1-03: Panel Shadow Risk en `/customers/[id]/risk` (2-3 días)
- F1-04: HITL Task Queue UI en `/tasks` (3-4 días)
- F1-05: Dashboard ejecutivo real con KPIs (1 semana)
- F1-06: `prefilter_rules` + PreFilter service (3-4 días)

### Eje 2 — PresternativaSync (Sprint 2)
- P-01: Investigar y documentar schema del Excel (1-2 días)
- P-02: `customer_financial_snapshots` modelo (1 día)
- P-03: PresternativaSync service con openpyxl (1 semana)
- P-04: UI `/presterativa/sync` (2-3 días)
- P-05: Auto-generación CustomerLifecycleEvents desde sync (2-3 días)

### Eje 3 — Capa Conversacional (Sprint 3)
- C-01: frm-chats: parser dual-format + PII sanitizer (1 semana)
- C-02: API import + whatsapp_import_batches (3-4 días)
- C-03: UI `/conversations/import` + revisión matches (3-4 días)
- C-04: Timeline `/customers/[id]/conversations` (2-3 días)
- C-05: Vista global `/conversations` (2-3 días)

### Eje 4 — Monorepo & CI/CD (Sprint 4)
- M-01: Crear estructura frm-system monorepo (2-3 días)
- M-02: Migrar lamas-py → apps/lamas + apps/lamas-web (1 día)
- M-03: Formalizar packages/frm-contracts (2-3 días)
- M-04: docker-compose.yml orquestal unificado (1 día)
- M-05: Fase 7 CI/CD + Deploy VPS + SSL (1 semana)

### Eje 5 — Analítica avanzada (Sprint 5+)
- A-01: Portafolio Analysis (3-4 días)
- A-02: Reportes PDF/CSV (3-4 días)
- A-03: Alertas de ciclo de vida (1 semana)
- A-04: Payload enriquecido a CreditGraph (1 semana)
- A-05: Integración Chatwoot (TBD)

---

## 10. ADRs registradas

| ADR | Título |
|---|---|
| 007 | FRM nombre canónico; LAMaS = submodulo de origination |
| 008 | Presterativa = Core; integración HITL manual |
| 009 | Tenant type: Cooperativa vs Financiera |
| 010 | Single-tenant por instancia (sin tenant_id en schema) |
| 011 | Monorepo frm-system (Python + TypeScript) |
| 012 | PresternativaSync vía Excel bulk + DOCX backlog |
| 013 | CustomerFinancialStatus enum (8 estados) |
| 014 | PreFilter en FRM + CreditGraph para análisis profundo |
| 015 | WhatsApp parser dual-format Android/iOS + regex PII |

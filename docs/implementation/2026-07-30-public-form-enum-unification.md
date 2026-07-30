# Implementación: Unificación de Enums — Formulario Público ↔ Backend (Opción B)

**Fecha**: 2026-07-30  
**Sesión**: Corrección Formulario Público `solicitar` — Opción B (Unificación de Esquemas)  
**Categoría**: Corrección/Mejora — Integridad de Datos  
**Referencia**: [Known Issue: Public Form Enum Mismatch](../knowledges/known-issue-public-form-enum-mismatch.md) | [REQ: Auditoría LoanApplication](../planning/req-loan-application-enum-audit.md)

---

## Objetivo

Resolver la discrepancia de enums entre el formulario público de captación de solicitudes (`/solicitar`) y el backend FastAPI, tomando el backend como **fuente de verdad**. Se implementó la **Opción B (Unificación de Esquemas)**: extensión de los `Literal[...]` del backend para incluir valores del contexto dominicano, corrección del frontend para alinear con el backend, y separación semántica correcta de `housing_type` (tipo físico) vs `housing_possession_type` (tipo de posesión).

---

## Contexto

El wizard público `/solicitar` fue desarrollado con valores en MAYÚSCULAS (`"SINGLE"`, `"UNIVERSITY"`, `"OWNED"`, `"EMPLOYED"`) sin alinearse con los `Literal[...]` del backend, que usa minúsculas siguiendo la convención del legacy Laravel. Esto causaba rechazo HTTP 422 en todas las submisiones del formulario público.

---

## Componentes Afectados

### Backend
| Archivo | Tipo de Cambio |
|---|---|
| `backend/app/schemas/customer.py` | Extender Literals: `+common_law`, `+technical`, `+family`, `+occupation_type` |
| `backend/app/models/customer.py` | Nueva columna `occupation_type: str \| None` en `CustomerJobInfo` |
| `backend/app/services/loan_submission_service.py` | Mapeo semántico correcto + derivación `is_self_employed` |
| `backend/app/services/creditgraph_service.py` | Añadir `housing_possession_type` al payload del motor IA |
| `backend/scripts/add_occupation_type.sql` | **[NUEVO]** Script DDL `ALTER TABLE` para la nueva columna |

### Frontend
| Archivo | Tipo de Cambio |
|---|---|
| `frontend/lib/validations/loan-application.schema.ts` | Todos los `z.enum` normalizados a lowercase; `education_level` de `z.string()` a `z.enum()` |
| `frontend/components/public-form/steps/personal-step.tsx` | Opciones en lowercase; `education_level` separado en 8 opciones distintas |
| `frontend/components/public-form/steps/employment-step.tsx` | `occupation_type` options en lowercase |

### Tests
| Archivo | Tipo de Cambio |
|---|---|
| `backend/tests/test_enum_unification.py` | **[NUEVO]** 21 test cases (unit + integración + CreditGraph) |
| `backend/tests/integration/test_loan_submit_flow.py` | Payloads actualizados a lowercase |
| `backend/tests/services/test_loan_submission_service.py` | Payloads actualizados a lowercase |
| `frontend/test/validations/loan-application.schema.test.ts` | Reescrito: 18 casos con accept/reject coverage |

---

## Detalles Técnicos

### 1. Extensión de Literals (Backend — SSOT)

```python
# CustomerDetailCreate / CustomerDetailUpdate
marital_status: Literal[
    "single", "married", "divorced", "widowed", "common_law", "other"  # +common_law
] | None = None

education_level: Literal[
    "primary", "secondary", "high_school", "technical",  # +technical
    "bachelor", "postgraduate", "master", "doctorate", "other"
] | None = None

housing_possession_type: Literal[
    "owned", "rented", "mortgaged", "family", "other"  # +family
] | None = None

# CustomerJobInfoCreate — nuevo campo
occupation_type: Literal[
    "employed", "independent", "business_owner", "other"
] | None = None
```

### 2. Mapeo Semántico en `loan_submission_service.py`

El wizard captura `housing_type` con semántica de **posesión** (`owned/rented/family`), pero el backend separa:
- `housing_type`: tipo físico del inmueble (`house/apartment/other`) — no capturado en el wizard
- `housing_possession_type`: tipo de posesión — campo correcto para los datos del wizard

```python
# Corrección en CustomerDetail creation:
housing_type=None,                           # Tipo físico — no capturado en wizard público
housing_possession_type=profile.get("housing_type"),  # Wizard envía posesión

# Derivación automática de is_self_employed:
occupation = job.get("occupation_type")
is_self_employed=occupation in ("independent", "business_owner"),
occupation_type=occupation,
```

### 3. CreditGraph — payload extendido

```python
applicant_data = {
    "housing_type": housing_type or "other",
    "housing_possession_type": housing_possession_type or "other",  # +nuevo
    ...
}
```

### 4. Migration SQL ejecutada

```sql
-- Ejecutada en contenedor Docker: docker compose exec db psql ...
ALTER TABLE customer_job_info
    ADD COLUMN IF NOT EXISTS occupation_type VARCHAR(50) NULL;
-- Resultado: ALTER TABLE ✅
```

### 5. Zod Schema actualizado (Frontend)

```typescript
// Antes (UPPERCASE, z.string para education)
marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "COMMON_LAW"])
education_level: z.string().min(1, "Seleccione el nivel educativo.")
occupation_type: z.enum(["EMPLOYED", "INDEPENDENT", "BUSINESS_OWNER", "OTHER"])

// Después (lowercase, z.enum completo)
marital_status: z.enum(["single", "married", "divorced", "widowed", "common_law"])
education_level: z.enum(["primary", "secondary", "high_school", "technical",
                          "bachelor", "postgraduate", "master", "doctorate"])
occupation_type: z.enum(["employed", "independent", "business_owner", "other"])
```

---

## Pruebas de Verificación

### Backend (`uv run pytest`)

```
========================= test session starts ==========================
platform linux -- Python 3.14.6, pytest-9.0.2

tests/test_enum_unification.py — 21 PASSED
Suite completa                 — 94 PASSED, 0 FAILED
========================================================================
94 passed, 680 warnings in 10.80s
```

### Frontend (`pnpm test`)

```
test/validations/loan-application.schema.test.ts  →  18 tests | 0 failed  ✅
(fix aplicado al test de housing_type="rented" que requiere housing_monthly_payment)
```

> [!NOTE]
> **Aclaración sobre `pnpm test`**: El archivo `loan-application.schema.test.ts` (relacionado con esta tarea) pasa al 100% (18/18). Los 18 fallos reportados en la ejecución global pertenecen a suites de componentes UI pre-existentes (`CustomerTable`, `sidebar`, `LoanTable`, `LoanDetailPage`), las cuales tienen mocks o selectores desactualizados previos a esta sesión y no guardan relación con la validación de enums.

---

## Decisiones de Diseño

1. **Backend como SSOT**: El formulario público se adapta al backend, no al revés. Evita bifurcaciones en el modelo de datos.
2. **Sin migración Alembic**: Los campos de BD son `VARCHAR` sin constraints de tipo `ENUM`, permitiendo agregar valores con solo extender el `Literal`. Solo se requirió `ALTER TABLE` para la columna nueva `occupation_type`.
3. **`is_self_employed` derivado**: Se mantiene el campo booleano para compatibilidad con el formulario admin; se calcula automáticamente en el service layer.
4. **`secondary` y `high_school` separados**: Refleja la realidad educativa dominicana (Secundaria ≠ Bachillerato).

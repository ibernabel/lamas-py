# Documento de Requerimientos: Auditoría y Corrección de LoanApplication

**Tipo**: Documento de Requerimientos Técnicos  
**Fecha**: 2026-07-30  
**Autor**: Idequel Bernabel  
**Estado**: 📋 Pendiente de ejecución  
**Dependencia**: Corrección del formulario público `solicitar/page.tsx` (ver [known-issue-public-form-enum-mismatch.md](../knowledges/known-issue-public-form-enum-mismatch.md))

---

## 1. Objetivo

Auditar y corregir la arquitectura de datos de las **solicitudes de préstamo (LoanApplication)** en todas las interfaces del sistema LAMaS, asegurando:

1. **Consistencia de enums**: Los valores enviados por el frontend coinciden con los `Literal` del backend.
2. **Alineación semántica**: Los campos del wizard público reflejan correctamente el modelo de datos del admin y el backend.
3. **Integridad para CreditGraph AI**: Los datos que ingresan al motor de análisis son limpios y predecibles.

---

## 2. Contexto y Hallazgos del Auditor

La auditoría realizada el 2026-07-30 (subagente LoanApplication Auditor) identificó las siguientes discrepancias entre el sistema legacy Laravel y la nueva implementación:

### 2.1 Arquitectura Dual (Estado Actual)

El sistema tiene **dos formularios de LoanApplication** con propósitos distintos:

| Formulario | Ruta | Propósito | Estado |
|---|---|---|---|
| **Dashboard Admin** (`LoanForm.tsx`) | `/loans/new` | Creación para `customer_id` existente | ✅ Funcional |
| **Wizard Público** (`solicitar/page.tsx`) | `/solicitar` | Captación pública + onboarding nuevo cliente | ⚠️ Enums inválidos |

### 2.2 Campos con Inconsistencia de Enums (Formulario Público)

Ver detalle completo en [known-issue-public-form-enum-mismatch.md](../knowledges/known-issue-public-form-enum-mismatch.md).

Resumen de campos afectados:
- `marital_status`: valores UPPERCASE vs lowercase + valor `COMMON_LAW` sin equivalente
- `housing_type`: semántica diferente (posesión vs tipo físico)
- `education_level`: UPPERCASE + valor `TECHNICAL` sin equivalente en backend
- `occupation_type`: campo nuevo sin soporte en backend schemas

### 2.3 Diferencias con Legacy Laravel

| Campo | Legacy (Laravel) | Admin Form (✅) | Wizard Público (⚠️) |
|---|---|---|---|
| `frequency` | `weekly`, `biweekly`, `monthly` | `daily`, `weekly`, `biweekly`, `monthly` | N/A |
| `marital_status` | lowercase con `other` | lowercase con `other` | UPPERCASE sin `other` |
| `housing_type` | `owned/rented/mortgaged/other` | `house/apartment/other` | `OWNED/RENTED/MORTGAGED/FAMILY` |
| `education_level` | lowercase 8 valores | lowercase 8 valores | UPPERCASE 5 valores diferentes |
| `purpose` (loan) | textarea libre | `Input` libre | `Select` con enums UPPERCASE |

---

## 3. Alcance de la Corrección

### 3.1 En Scope (Prioridad Alta)

#### REQ-LA-001: Corregir enums del wizard público
**Descripción**: Los valores de `marital_status`, `education_level` y `housing_type` en `solicitar/page.tsx` deben alinearse con los `Literal` del backend.

**Archivos**:
- `frontend/app/(public)/solicitar/page.tsx`
- `frontend/lib/validations/loan-application.schema.ts` (schema Zod del wizard)

**Criterio de aceptación**: El wizard completa el flujo de 5 pasos sin errores HTTP 422 del backend.

---

#### REQ-LA-002: Resolver campo `housing_type` — semántica dual
**Descripción**: Definir si el wizard público debe capturar:
- (A) Solo `housing_possession_type` (propia/alquilada/hipotecada) — mapeado al campo correcto del backend, **o**
- (B) Ambos campos separados en el wizard (tipo físico + tipo de posesión)

**Decisión requerida de stakeholder**: ¿Separar en 2 campos el wizard o mantener 1 campo de posesión?

**Archivos afectados**:
- `frontend/app/(public)/solicitar/page.tsx`
- `backend/app/schemas/customer.py` (si se agrega `housing_possession_type` al payload público)

**Criterio de aceptación**: El campo enviado al backend existe y tiene un valor válido según el `Literal` correspondiente.

---

#### REQ-LA-003: Mapear o agregar `COMMON_LAW` en estado civil
**Descripción**: El wizard público ofrece "Unión Libre" (`COMMON_LAW`) pero el backend no tiene ese valor.

**Opciones**:
- (A) Mapear `COMMON_LAW` → `"other"` en el frontend antes de enviar
- (B) Agregar `"common_law"` al `Literal` del backend y migrar DB

**Criterio de aceptación**: El valor enviado es aceptado por el backend sin 422.

---

#### REQ-LA-004: Mapear o agregar `TECHNICAL` en nivel educativo
**Descripción**: "Técnico Superior" es una realidad educativa dominicana importante. El backend no tiene equivalente.

**Opciones**:
- (A) Mapear `TECHNICAL` → `"other"` en el frontend
- (B) Agregar `"technical"` al enum del backend (recomendado por relevancia de negocio)

**Criterio de aceptación**: El valor se almacena correctamente y el label en la UI es descriptivo.

---

#### REQ-LA-005: Resolver `occupation_type` — nuevo campo sin soporte backend
**Descripción**: El wizard captura `occupation_type` (`EMPLOYED`, `INDEPENDENT`, `BUSINESS_OWNER`, `OTHER`) pero el backend no tiene este campo. En legacy era `is_self_employed` (booleano).

**Opciones**:
- (A) Mapear: `EMPLOYED/BUSINESS_OWNER` → `is_self_employed: false/true`
- (B) Agregar `occupation_type: Literal[...]` a `CustomerJobInfoCreate`

**Criterio de aceptación**: La información de tipo de empleo se almacena de forma útil para CreditGraph AI.

---

### 3.2 En Scope (Prioridad Media)

#### REQ-LA-006: `loan_request.purpose` — estandarizar valores
**Descripción**: El wizard usa valores UPPERCASE (`RENOVATION`, `DEBT_CONSOLIDATION`, `VEHICLE`, etc.) para `purpose`. El Dashboard Admin usa texto libre (`<Input>`). El backend acepta `str | None`.

**Acción**: Estandarizar los valores del wizard a minúsculas y documentar el dominio de valores válidos en el backend.

---

#### REQ-LA-007: `payment_bank` — estandarizar valores
**Descripción**: El wizard usa claves de banco (`BANRESERVAS`, `POPULAR`, `BHD`, etc.) pero el backend guarda el valor raw. Si el admin luego edita con texto libre, quedan inconsistencias.

**Acción**: Añadir un `Literal` o al menos documentar los valores estándar esperados.

---

### 3.3 Fuera de Scope (Esta iteración)

- Rediseño del wizard de 5 pasos (flujo UX)
- Nuevos campos de financial compliance (Law 172-13 ya implementados)
- Integración del resultado del wizard con CreditGraph trigger automático

---

## 4. Plan de Implementación Sugerido

### Fase 1 — Correcciones de Enums (2–4 horas)
1. Actualizar `solicitar/page.tsx`: cambiar valores de opciones a minúsculas
2. Actualizar schema Zod del wizard en `loan-application.schema.ts`
3. Implementar mapeo `COMMON_LAW` → `"other"` y `TECHNICAL` → `"other"` (o agregar al backend)
4. Resolver `housing_type` con decisión del stakeholder

### Fase 2 — Nuevos Campos Backend (2–3 horas)
1. Evaluar si agregar `occupation_type` a `CustomerJobInfoCreate`
2. Agregar `"technical"` y `"common_law"` al backend si se aprueba Opción B
3. Actualizar tests del backend

### Fase 3 — Verificación End-to-End (1–2 horas)
1. Completar el flujo del wizard en el navegador
2. Verificar que el backend recibe los datos correctamente (sin 422)
3. Confirmar que CreditGraph AI recibe las variables limpias

---

## 5. Criterios de Aceptación Globales

- [ ] El wizard de 5 pasos completa sin errores HTTP 422
- [ ] Los valores de enum del wizard coinciden con los `Literal` del backend
- [ ] Los datos almacenados en DB para `marital_status`, `education_level`, `housing_type` son valores válidos del enum
- [ ] CreditGraph AI recibe `housing_type` y `education_level` en formato esperado
- [ ] El formulario admin (`CustomerForm.tsx`) y el wizard público usan los mismos valores de enum

---

## 6. Archivos Involucrados

| Archivo | Tipo de cambio |
|---|---|
| `frontend/app/(public)/solicitar/page.tsx` | Corregir valores de options en selects |
| `frontend/lib/validations/loan-application.schema.ts` | Actualizar Zod enums |
| `backend/app/schemas/customer.py` | Agregar valores faltantes (si Opción B) |
| `backend/app/schemas/loan_application.py` | Documentar dominio de `purpose` |
| `backend/tests/test_loan_application*.py` | Actualizar tests si cambian schemas |

---

## 7. Referencias

- [Auditoría completa LoanApplication](../implementation/2026-07-30-customer-form-enum-audit-restoration.md)
- [Known Issue: Public Form Enum Mismatch](../knowledges/known-issue-public-form-enum-mismatch.md)
- [ADR 004: Restauración de Enums Semánticos](../decisions/004-enum-restoration-customer-fields.md)
- [Backend schemas — customer.py](../../backend/app/schemas/customer.py)
- [Wizard público](../../frontend/app/(public)/solicitar/page.tsx)

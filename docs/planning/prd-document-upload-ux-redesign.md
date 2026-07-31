# PRD — Phase 13: Document Upload UX Redesign & Business Rules

**Autor**: Antigravity (ASD Framework) & Idequel Bernabel
**Fecha**: 2026-07-31
**Estado**: 🟢 Aprobado — Decisiones del PO Incorporadas
**Fase**: 13
**Duración estimada**: 3–4 días
**Prioridad**: Alta — Impacta directamente el flujo operativo de análisis de crédito

---

## 1. Contexto y Problema

### 1.1 Estado Actual (Auditoría — Phase 9)

El módulo de documentos (Phase 9) implementó correctamente la infraestructura base: modelo `CustomerDocument` con 15 tipos, almacenamiento local/R2, versionado y el viewer modal. Sin embargo, la experiencia de usuario y las reglas de negocio de carga están **incompletas y desalineadas** con el flujo real de trabajo crediticio.

#### Gaps Identificados

| # | Área | Problema |
|---|------|----------|
| G-01 | Frontend | Solo **4 de 15 tipos** tienen medio de carga habilitado en la UI |
| G-02 | Frontend | Los mismos 2 documentos (`nid`, `labor_letter`) aparecen duplicados en el flujo de creación Y en el tab del perfil, sin sincronización |
| G-03 | Validación | No existe validación de tipo MIME por `document_type` (ej. NID acepta `.docx`) |
| G-04 | Validación | No existe validación de contenido contextual (ej. estado de cuenta BHD en slot de Popular) |
| G-05 | Lógica negocio | No existe distinción UI entre documentos **requeridos vs. opcionales** |
| G-06 | Lógica negocio | No existe distinción UI entre documentos del **Cliente** vs. de la **Solicitud** |
| G-07 | Lógica negocio | Documentos de garantía nunca tienen medio de carga — dependen del tipo de préstamo, que **no existe como campo en el modelo** |
| G-08 | Backend | `document_type` es `str` libre sin enum — cualquier valor es aceptado |
| G-09 | Backend | No hay endpoint `GET /documents/loans/{loan_id}` — frontend filtra con lógica frágil |
| G-10 | Backend | No hay validación de MIME ni tamaño de archivo en el backend |
| G-11 | Tests | Solo 1 archivo de test de frontend (`DocumentViewerModal.test.tsx`). Backend: 4 tests sin cobertura de errores |
| G-12 | UX | No hay indicador de progreso de expediente ni distinción visual requerido/opcional |

---

## 2. Objetivo

Rediseñar la capa de carga de documentos para que:

1. **Refleje la lógica de negocio crediticia**: qué documentos, para qué entidad, en qué momento del flujo.
2. **Guíe al usuario** con validaciones claras de tipo de archivo y contexto del banco.
3. **Organice los documentos por secciones** lógicas alineadas al flujo de trabajo.
4. **Sea extensible**: nuevos tipos de garantía o bancos se agregan en configuración, sin cambios de componentes.

---

## 3. Lógica de Negocio: Mapeo de Documentos (Decisiones del PO)

### 3.1 Entidad: Cliente (`Customer`) — Documentos de Perfil

Se cargan al **registrar o completar el perfil** del cliente. Independientes de cualquier solicitud de crédito.

| Tipo | Etiqueta UI | Decisión PO | Formato Aceptado | Notas |
|------|-------------|-------------|------------------|-------|
| `nid` | Cédula de Identidad (Solicitante) | ✅ **Requerido** | `image/*`, `application/pdf` | Foto legible o scan. JPEG/PNG preferido. |
| `guarantor_nid` | Cédula del Garante / Codeudor | ⚡ **Condicional** | `image/*`, `application/pdf` | Solo si hay garante registrado en la solicitud. |
| `utility_bill` | Comprobante de Residencia | ⬜ **Opcional** | `image/*`, `application/pdf` | Agua, luz, teléfono. No requerido — genera fricción innecesaria. |
| ~~`bureau_authorization`~~ | ~~Autorización Buró~~ | 🚫 **Excluido** | — | Cubierto por `legal_consent` checkbox del formulario digital. No se requiere documento separado. |
| ~~`chat_transcript`~~ | ~~Transcripción de Chat~~ | 🚫 **Excluido de este módulo** | — | Pertenece a la Capa Conversacional del Sistema FRM. |
| `other_support` | Documento de Soporte Adicional | ⬜ **Opcional** | `*` | Libre uso para notas o comprobantes. |

> **Sobre `guarantor_nid`**: Se activa únicamente cuando existe un garante/codeudor asociado a la solicitud de préstamo, no de forma libre en el perfil del cliente.

### 3.2 Entidad: Solicitud de Préstamo (`LoanApplication`) — Documentos de Evaluación

#### Sección A — Capacidad de Pago

| Tipo | Etiqueta UI | Decisión PO | Formato Aceptado | Notas |
|------|-------------|-------------|------------------|-------|
| `labor_letter` | Carta de Trabajo | ✅ **Requerido** | `application/pdf`, `image/*` | Emitida por el empleador. Tiene más peso que `pay_stub`. |
| `pay_stub` | Volante de Pago (Nómina) | ⬜ **Opcional** | `application/pdf`, `image/*` | Deseable, fortalece el análisis. `labor_letter` y `bank_statement` tienen mayor peso. |
| `tax_declaration` | Declaración de Impuestos IR-1/IR-2 | ⬜ **Opcional** | `application/pdf` | Solo si es cuenta propia o negocio (no asalariado). |
| `business_financial_statement` | Estados Financieros del Negocio | ⬜ **Opcional** | `application/pdf` | Solo si es negocio o no asalariado. Certificados por CPA. |

#### Sección B — Análisis Crediticio

| Tipo | Etiqueta UI | Decisión PO | Formato Aceptado | Notas |
|------|-------------|-------------|------------------|-------|
| `bank_statement` | Estado de Cuenta Bancario | ✅ **Requerido** | `application/pdf` | Un slot con selector de banco obligatorio. Ver Sección 4.2. |
| `credit_report` | Reporte de Buró de Crédito | ✅ **Requerido** | `application/pdf` | TransUnion / DataCrédito. Solo PDF. |

#### Sección C — Garantías (Opcional y Condicional por `collateral_type`)

> **BLOCKER (OQ-02 resuelta):** El modelo `LoanApplication` **no tiene campo `loan_type` ni campo de garantía**. Solo existe `purpose` (texto libre) en `LoanApplicationDetail`. La Sección C **requiere agregar `collateral_type`** al modelo como prerequisito de esta fase.

| Tipo | Etiqueta UI | Decisión PO | Formato Aceptado | Condición |
|------|-------------|-------------|------------------|-----------|
| `vehicle_registration` | Matrícula / Título de Vehículo | ⚡ **Condicional** | `application/pdf`, `image/*` | `collateral_type in [vehicle, mixed]` |
| `property_title` | Título de Propiedad | ⚡ **Condicional** | `application/pdf` | `collateral_type in [property, mixed]` |
| `collateral_appraisal` | Tasación Pericial de Garantía | ⚡ **Condicional** | `application/pdf` | `collateral_type != none` |

### 3.3 Regla de Orquestación — Flujo de Trabajo

```
Onboarding de Cliente (CustomerForm — post-creación)
└── nid [✅ Requerido] | utility_bill, other_support [⬜ Opcionales]

Perfil del Cliente (/customers/[id] → Tab "Documentos")
├── Sección "Identificación"
│   ├── nid              [✅ Requerido]
│   ├── guarantor_nid    [⚡ Condicional — solo si hay garante]
│   └── utility_bill     [⬜ Opcional]
└── Sección "Soporte Adicional"
    └── other_support    [⬜ Opcional]

Solicitud de Préstamo (/loans/[id] → Sección Documentos)
├── Sección A "Capacidad de Pago"
│   ├── labor_letter     [✅ Requerido]
│   ├── pay_stub         [⬜ Opcional]
│   ├── tax_declaration  [⬜ Opcional]
│   └── business_financial_statement [⬜ Opcional]
├── Sección B "Análisis Crediticio"
│   ├── bank_statement   [✅ Requerido — selector de banco]
│   └── credit_report    [✅ Requerido]
└── Sección C "Garantías" [visible solo si collateral_type != none]
    ├── vehicle_registration  [⚡ si vehicle/mixed]
    ├── property_title        [⚡ si property/mixed]
    └── collateral_appraisal  [⚡ si cualquier garantía]
```

---

## 4. Reglas de Validación

### 4.1 Validación por Tipo de Archivo (Frontend + Backend)

| document_type | MIME types permitidos | Extensiones |
|---|---|---|
| `nid`, `guarantor_nid` | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | .jpg, .jpeg, .png, .webp, .pdf |
| `utility_bill` | `image/jpeg`, `image/png`, `application/pdf` | .jpg, .jpeg, .png, .pdf |
| `labor_letter`, `pay_stub` | `image/jpeg`, `image/png`, `application/pdf` | .jpg, .jpeg, .png, .pdf |
| `bank_statement`, `credit_report` | `application/pdf` | **.pdf únicamente** |
| `tax_declaration`, `business_financial_statement` | `application/pdf` | .pdf únicamente |
| `vehicle_registration`, `property_title`, `collateral_appraisal` | `image/jpeg`, `image/png`, `application/pdf` | .jpg, .jpeg, .png, .pdf |
| `other_support` | `image/*`, `application/pdf`, `text/*` | .jpg, .png, .pdf, .txt, .docx |

**Tamaño máximo por archivo**: **10 MB** (confirmado por PO — aplica a todos los tipos).

### 4.2 Bank Statement — Decisión PO: Selector de Banco

Un único componente de upload con **selector de banco obligatorio** (no slots fijos por banco).

**Bancos MVP** — configurable en código, sin UI de configuración:

```typescript
// lib/config/document-types.ts
export const SUPPORTED_BANKS = [
  { value: "popular",    label: "Banco Popular Dominicano" },
  { value: "bhd",        label: "Banco BHD León" },
  { value: "banreservas", label: "Banco de Reservas" },
] as const;
```

**Backlog CreditGraph**: El motor actualmente solo parsea estados de cuenta de estos 3 bancos. Ampliar soporte a otros bancos es prerequisito para aceptar documentos de otras entidades. Documentado como deuda técnica en `docs/knowledges/`.

### 4.3 Validación de Contenido PDF — Backlog

La verificación automática de que el PDF corresponde al banco seleccionado (OCR) queda **fuera de scope de esta fase**.

- **Esta fase**: Advertencia visual al usuario: *"Asegúrate de subir el estado de cuenta del banco seleccionado."*
- **Futuro**: CreditGraph AI valida el banco real del PDF, informa discrepancias en su respuesta de análisis y propone reclasificación si es necesario.

### 4.4 Enum en Backend — 13 Tipos Activos

`document_type` migra de `str` libre a `DocumentTypeEnum`. Se excluyen `bureau_authorization` (cubierto por consent digital) y `chat_transcript` (FRM layer):

```python
class DocumentTypeEnum(str, Enum):
    NID = "nid"
    GUARANTOR_NID = "guarantor_nid"
    UTILITY_BILL = "utility_bill"
    LABOR_LETTER = "labor_letter"
    PAY_STUB = "pay_stub"
    BANK_STATEMENT = "bank_statement"
    CREDIT_REPORT = "credit_report"
    TAX_DECLARATION = "tax_declaration"
    BUSINESS_FINANCIAL_STATEMENT = "business_financial_statement"
    VEHICLE_REGISTRATION = "vehicle_registration"
    PROPERTY_TITLE = "property_title"
    COLLATERAL_APPRAISAL = "collateral_appraisal"
    OTHER_SUPPORT = "other_support"
```

Registros históricos con `bureau_authorization` o `chat_transcript` se conservan en la DB pero no se crean nuevos.

---

## 5. Componentes a Crear/Modificar

### 5.1 Nuevos Archivos (Frontend)

| Archivo | Propósito |
|---------|-----------|
| `lib/config/document-types.ts` | Catálogo central: MIME, etiquetas, entidad, condiciones, `SUPPORTED_BANKS` |
| `components/documents/DocumentSlot.tsx` | Tarjeta de upload: badge requerido/opcional, validación MIME+tamaño, selector de banco |
| `components/documents/DocumentGroup.tsx` | Agrupador de slots por sección con título y contador |
| `components/documents/DocumentProgress.tsx` | Indicador: "N de M documentos requeridos cargados" |
| `components/documents/CustomerDocumentsPanel.tsx` | Panel de cliente — secciones Identificación y Soporte Adicional |
| `components/documents/LoanDocumentsPanel.tsx` | Panel de préstamo — secciones A, B y C (condicional por `collateral_type`) |

### 5.2 Archivos a Modificar (Frontend)

| Archivo | Cambio |
|---------|--------|
| `components/documents/DocumentUpload.tsx` | Refactorizar como base de `DocumentSlot.tsx` |
| `components/documents/DocumentsSection.tsx` | **Deprecar** — marcado legacy |
| `app/(dashboard)/customers/[id]/page.tsx` | Reemplazar `<DocumentsSection>` por `<CustomerDocumentsPanel>` |
| `components/customers/CustomerForm.tsx` | Step post-creación: solo `nid` requerido |
| `app/(dashboard)/loans/[id]/page.tsx` | Reemplazar bloque por `<LoanDocumentsPanel>` |
| `lib/api/documents.ts` | Agregar `listLoanDocuments(loanId)` |
| `lib/api/types.ts` | `DocumentType` union literal; `collateral_type` en `LoanApplication` |

### 5.3 Archivos a Modificar (Backend)

| Archivo | Cambio |
|---------|--------|
| `app/models/loan_application.py` | Agregar `collateral_type: Optional[str]` (prerequisito Sección C) |
| `app/models/document.py` | Agregar `DocumentTypeEnum` con 13 tipos activos |
| `app/schemas/document.py` | Usar enum; agregar `file_size_bytes` en response |
| `app/api/v1/endpoints/documents.py` | Validar enum + MIME + tamaño; agregar `GET /loans/{loan_id}`; auth en listado |

---

## 6. Open Questions — Resueltas

| # | Pregunta | Decisión |
|---|----------|----------|
| OQ-01 | Bancos para `bank_statement` | BHD, Popular, Banreservas para MVP. Un componente con selector de banco. Configurable en `document-types.ts`. Sin UI de configuración. |
| OQ-02 | ¿`loan_type` existe en el modelo? | **No existe.** Se requiere agregar `collateral_type` a `LoanApplication` como prerequisito. |
| OQ-03 | Límite de tamaño | **10 MB confirmado** para todos los tipos. |
| OQ-04 | ¿`guarantor_nid` libre o condicional? | **Condicional** — solo cuando hay garante en la solicitud. |

---

## 7. Known Issues a Documentar en `docs/knowledges/`

| ID | Problema | Severidad |
|----|----------|-----------|
| KI-DOC-001 | `document_type` acepta cualquier string en backend — sin enum | 🔴 Alta |
| KI-DOC-002 | Frontend filtra docs de préstamo localmente con lógica frágil (bug documentado en código) | 🔴 Alta |
| KI-DOC-003 | Sin validación de MIME type real ni tamaño de archivo en upload | 🟡 Media |
| KI-DOC-004 | Duplicación de documentos en `CustomerForm` y tab de perfil sin sincronización | 🟡 Media |
| KI-DOC-005 | No existe endpoint `GET /documents/loans/{loan_id}` | 🔴 Alta |
| KI-DOC-006 | `requiredTypes` hardcodeado en páginas sin config centralizada | 🟢 Baja |
| KI-DOC-007 | `LoanApplication` no tiene `loan_type` ni `collateral_type` | 🟡 Media |
| KI-DOC-008 | CreditGraph solo parsea estados de cuenta de BHD, Popular y Banreservas | 🟡 Media (CreditGraph backlog) |
| KI-DOC-009 | Validación de contenido PDF (OCR/verificación banco) fuera de scope | 🟢 Baja (backlog) |
| KI-DOC-010 | `R2StorageService` usa `boto3` síncrono en funciones `async` — bloquea event loop | 🟡 Media |

---

## 8. Plan de Implementación

### Sprint 1 — Backend Foundation (Día 1)

- [ ] **Step 13.1**: Agregar `collateral_type: Optional[str]` a `LoanApplication` *(prerequisito Sección C)*
- [ ] **Step 13.2**: Crear `DocumentTypeEnum` con 13 tipos activos en `app/models/document.py`
- [ ] **Step 13.3**: Actualizar `app/schemas/document.py` — usar enum; agregar `file_size_bytes` en response
- [ ] **Step 13.4**: Validar enum + MIME + tamaño (10 MB) en endpoints de upload → HTTP 422 / 413
- [ ] **Step 13.5**: Agregar `CurrentUser` como dependencia en `GET /customers/{customer_id}` (fix de seguridad)
- [ ] **Step 13.6**: Implementar `GET /documents/loans/{loan_id}`
- [ ] **Step 13.7**: Escribir 8 tests de backend (pytest)

### Sprint 2 — Frontend Config & Core Components (Día 2)

- [ ] **Step 13.8**: Crear `lib/config/document-types.ts` con catálogo completo y `SUPPORTED_BANKS`
- [ ] **Step 13.9**: Actualizar `lib/api/documents.ts` — agregar `listLoanDocuments()`
- [ ] **Step 13.10**: Actualizar `lib/api/types.ts` — `DocumentType` union, `collateral_type` en `LoanApplication`
- [ ] **Step 13.11**: Crear `DocumentSlot.tsx` — validación MIME, tamaño, badge estado, selector de banco
- [ ] **Step 13.12**: Crear `DocumentGroup.tsx` — agrupador con contador de completitud
- [ ] **Step 13.13**: Crear `DocumentProgress.tsx` — indicador de progreso del expediente

### Sprint 3 — Panels e Integración (Día 3)

- [ ] **Step 13.14**: Crear `CustomerDocumentsPanel.tsx` — Identificación + Soporte Adicional
- [ ] **Step 13.15**: Crear `LoanDocumentsPanel.tsx` — Secciones A, B, C (condicional por `collateral_type`)
- [ ] **Step 13.16**: Actualizar `CustomerForm.tsx` — step post-creación con solo `nid` requerido
- [ ] **Step 13.17**: Actualizar `/customers/[id]/page.tsx` — reemplazar por `CustomerDocumentsPanel`
- [ ] **Step 13.18**: Actualizar `/loans/[id]/page.tsx` — reemplazar por `LoanDocumentsPanel`

### Sprint 4 — Tests y Documentación (Día 4)

- [ ] **Step 13.19**: Tests unitarios frontend (Vitest) — 12 tests nuevos
- [ ] **Step 13.20**: Documentar Known Issues (KI-DOC-001, 002, 007, 008, 009, 010) en `docs/knowledges/`
- [ ] **Step 13.21**: Crear `docs/implementation/phase-13-document-upload-ux-redesign.md`
- [ ] **Step 13.22**: Actualizar `ROADMAP.md` con Phase 13

---

## 9. Plan de Tests

### Tests Backend — pytest (8 tests)

| ID | Descripción | Tipo |
|----|-------------|------|
| T-BE-01 | Upload con `document_type` inválido → HTTP 422 | Unitario |
| T-BE-02 | Upload con MIME no permitido para el tipo → HTTP 422 | Unitario |
| T-BE-03 | Upload con archivo > 10 MB → HTTP 413 | Unitario |
| T-BE-04 | Upload válido `nid` + JPEG → HTTP 201 + metadata correcta | Integración |
| T-BE-05 | Upload válido `credit_report` + PDF → HTTP 201 | Integración |
| T-BE-06 | Upload `bank_statement` sin `bank_name` → HTTP 422 | Unitario |
| T-BE-07 | `GET /documents/loans/{loan_id}` retorna solo docs de ese loan | Integración |
| T-BE-08 | Versionado: upload duplicado marca anterior como `is_latest=False` | Integración |

### Tests Frontend — Vitest (12 tests)

| ID | Descripción | Tipo |
|----|-------------|------|
| T-FE-01 | `DocumentSlot` muestra badge "Requerido" cuando `required=true` | Unitario |
| T-FE-02 | `DocumentSlot` rechaza archivo de MIME no permitido — error visible | Unitario |
| T-FE-03 | `DocumentSlot` muestra selector de banco cuando `document_type="bank_statement"` | Unitario |
| T-FE-04 | `DocumentSlot` rechaza archivo > 10 MB — error visible | Unitario |
| T-FE-05 | `DocumentGroup` renderiza título de sección y todos sus slots | Unitario |
| T-FE-06 | `DocumentProgress` muestra "2 de 3 documentos requeridos" correctamente | Unitario |
| T-FE-07 | `CustomerDocumentsPanel` renderiza sección Identificación con slots correctos | Unitario |
| T-FE-08 | `LoanDocumentsPanel` oculta Sección C cuando `collateralType="none"` | Unitario |
| T-FE-09 | `document-types.ts`: `getDocumentConfig('nid')` retorna MIME correcto | Unitario |
| T-FE-10 | `document-types.ts`: `getCustomerDocuments()` retorna solo tipos de cliente | Unitario |
| T-FE-11 | `DocumentSlot` en estado cargado muestra checkmark y nombre de archivo | Unitario |
| T-FE-12 | Flujo: seleccionar archivo válido → confirmar → mock API → toast de éxito | Integración (MSW) |

---

## 10. Criterios de Aceptación

- [ ] Los 13 tipos de documentos activos tienen slot de carga en el contexto correcto de la UI
- [ ] No es posible subir un `.docx` como `nid` — UI y backend lo rechazan con mensaje claro
- [ ] No es posible subir un `bank_statement` sin seleccionar el banco
- [ ] Advertencia visual aparece al seleccionar banco antes de confirmar el upload
- [ ] Indicador de progreso se actualiza al subir un documento requerido
- [ ] Sección C (Garantías) es invisible cuando `collateral_type = "none"` o no está definido
- [ ] 8 tests backend (pytest) + 12 tests frontend (Vitest) — todos en verde
- [ ] 10 Known Issues documentados en `docs/knowledges/`
- [ ] No hay credenciales hardcodeadas — solo variables `.env`

---

## 11. Backlog Items (Fuera de Scope — Documentados)

| Item | Descripción | Candidato a |
|------|-------------|-------------|
| PDF Content Validation | CreditGraph valida banco del PDF vs banco seleccionado | Phase futura (CreditGraph) |
| Multi-bank CreditGraph | Ampliar parsing a otros bancos más allá de BHD/Popular/Banreservas | Phase futura (CreditGraph) |
| R2 Async Fix | Migrar `R2StorageService` de `boto3` síncrono a `aioboto3` | Phase futura (Performance) |
| Document RBAC | Control de acceso por rol para eliminar documentos | Phase futura (Security) |
| Document Pagination | Paginación en `DocumentList` | Phase futura (UX) |
| Bank Config UI | Panel `/settings` para gestionar bancos | Phase 12 o futura |

---

## Referencias

- **Phase 9**: `docs/implementation/phase-7-document-management.md`
- **ADR 002**: `docs/decisions/002-document-proxy-auth.md`
- **Known Issue Viewer**: `docs/knowledges/known_issue-document-viewer-404.md`
- **Backend Model**: `backend/app/models/document.py`
- **Backend Endpoints**: `backend/app/api/v1/endpoints/documents.py`
- **Frontend Components**: `frontend/components/documents/`
- **Frontend API**: `frontend/lib/api/documents.ts`

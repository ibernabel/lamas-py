# PRD: Sistema de Auditoría y Versionado Temporal de Datos

**Proyecto**: LAMaS — Loan Applications Management System  
**Tipo**: Product Requirements Document (PRD)  
**Módulo**: `audit` (nuevo módulo transversal)  
**Fecha**: 2026-07-31  
**Autor**: Idequel Bernabel  
**Estado**: 🟢 Aprobado — Listo para implementación  
**Versión**: 1.1.0  
**Última actualización**: 2026-07-31 (decisiones del PO incorporadas)  

---

## 1. Resumen Ejecutivo

LAMaS realiza actualizaciones directas *in-place* sobre los registros de `Customer` y `LoanApplication` sin conservar un historial de los valores anteriores. Esto representa un punto ciego en la trazabilidad del negocio: no es posible saber quién modificó un campo, cuándo lo hizo ni qué valor tenía antes del cambio.

Este PRD define los requisitos para implementar un sistema de **auditoría de cambios a nivel de campo** (*field-level audit log*), que registre la línea de tiempo completa de modificaciones a las entidades `Customer` y `LoanApplication`, incluyendo el actor que realizó el cambio y los valores anterior y posterior de cada campo afectado.

---

## 2. Problema de Negocio

### 2.1 Contexto Operativo

LAMaS admite múltiples canales de entrada de datos para un mismo cliente:

| Canal de Entrada | Comportamiento Actual | Problema |
|---|---|---|
| Importación CSV | `upsert`: actualiza si NID existe | Sobreescribe sin historial |
| Formulario público web | Crea/actualiza solicitud | Puede sobreescribir datos verificados con datos incompletos |
| Edición manual por asesor | `PUT /customers/{id}` directo | Sin registro de autoría ni valor previo |
| Asignación de portafolio | `PATCH /customers/{id}/assign` | Sin historial del portafolio anterior |

### 2.2 Escenarios de Falla Actuales

**Escenario A — Importación CSV corrupta:**  
Un archivo CSV con datos de digitalización contiene un email incorrecto (OCR fallido). Se importa y sobrescribe el email correcto que el asesor había verificado previamente. No hay forma de recuperar el valor anterior ni saber cuándo ocurrió el cambio.

**Escenario B — Formulario público incompleto:**  
Un cliente llena el formulario público con datos preliminares. El sistema crea una solicitud y actualiza su perfil. Posteriormente, el asesor había llenado información más precisa que queda sobreescrita.

**Escenario C — Modificación incorrecta por asesor:**  
Un asesor modifica accidentalmente el salario de un cliente. Sin historial, no es posible hacer auditoría interna ni revertir el cambio.

**Escenario D — Auditoría de cumplimiento:**  
Durante una revisión de cumplimiento, se necesita demostrar quién aprobó una solicitud y si los datos del cliente al momento de la aprobación eran los mismos que en la originación.

### 2.3 Impacto del Problema

- **Riesgo regulatorio**: Sin trazabilidad, no se puede demostrar el proceso de debida diligencia.
- **Riesgo operativo**: Datos de clientes pueden degradarse silenciosamente sin posibilidad de recuperación.
- **Riesgo de fraude interno**: Sin auditoría de quién modifica qué, es imposible detectar manipulaciones.

---

## 3. Objetivos

### 3.1 Objetivos Primarios (MVP)

- Registrar cada modificación de campo en `Customer` y sus sub-entidades asociadas.
- Registrar cada modificación de campo en `LoanApplication` y sus sub-entidades.
- Capturar: actor (`user_id`), timestamp, entidad, campo, valor anterior y valor nuevo.
- Exponer un endpoint de API para consultar el historial de cambios de una entidad.
- Asociar cambios provenientes de procesos automáticos (importación CSV, formulario público) con un actor de sistema identificable.

### 3.2 Objetivos Secundarios (Iteraciones Futuras)

- UI de historial tipo "Google Docs": timeline visual de cambios con diff.
- Mecanismo de reversión (rollback) de un campo a un estado anterior.
- Alertas y notificaciones ante cambios en campos críticos.
- Reporte de actividad por asesor/usuario para supervisión gerencial.

### 3.3 No Está en Alcance (MVP)

- Event Sourcing completo (reconstrucción de estado desde eventos).
- Change Data Capture (CDC) a nivel de motor de BD (ej. Debezium).
- Auditoría de lecturas (solo se auditan escrituras).
- Auditoría de modelos de terceros (portfolios, promoters, users).

---

## 4. Usuarios y Casos de Uso

### 4.1 Actores

| Actor | Descripción |
|---|---|
| **Asesor (Advisor)** | Edita datos de clientes y solicitudes manualmente |
| **Analista / Supervisor** | Consulta el historial para validar datos y auditar asesores |
| **Sistema (importación CSV)** | Modifica datos de forma programática (actor = `system_import`) |
| **Sistema (formulario público)** | Crea/actualiza solicitudes desde el portal público (actor = `system_public_form`) |
| **Administrador** | Acceso completo al log de auditoría; puede generar reportes |

### 4.2 Casos de Uso

#### CU-01: Ver historial de cambios de un cliente
**Actor**: Analista / Supervisor  
**Flujo**:
1. El usuario navega al perfil del cliente en la UI.
2. Selecciona la pestaña "Historial de Cambios".
3. El sistema muestra una línea de tiempo ordenada con cada campo modificado, indicando el valor anterior, el valor nuevo, quién lo cambió y cuándo.

**Criterio de Aceptación**:
- La línea de tiempo está ordenada de más reciente a más antiguo.
- Se puede filtrar por: fecha, actor, entidad (datos personales, laborales, financieros).
- Los cambios provenientes de importación CSV están marcados con `source: csv_import`.

---

#### CU-02: Ver historial de cambios de una solicitud de préstamo
**Actor**: Analista / Supervisor  
**Flujo**:
1. El usuario abre una `LoanApplication`.
2. Selecciona la pestaña "Auditoría".
3. El sistema muestra todos los cambios de estado, montos y otros campos con su historial completo.

**Criterio de Aceptación**:
- Cada transición de estado (`status`) está registrada con el actor y timestamp.
- Los cambios en `amount`, `rate`, `term`, `quota` muestran el valor antes y después.

---

#### CU-03: Identificar el origen de una degradación de datos
**Actor**: Administrador  
**Flujo**:
1. Se detecta que el email de un cliente es incorrecto.
2. El administrador consulta el audit log del cliente.
3. El sistema muestra que el campo `email` fue modificado en una importación CSV (con `source: csv_import`) sobre un valor que había sido editado manualmente por el asesor Juan Pérez 3 días antes.

**Criterio de Aceptación**:
- El log identifica claramente el origen del cambio (manual vs. automático).
- Muestra el valor que existía antes de la importación CSV.

---

#### CU-04: Auditoría de asesor por supervisión
**Actor**: Supervisor  
**Flujo**:
1. El supervisor consulta la actividad de un asesor específico.
2. El sistema lista todos los campos que ese asesor modificó, en qué clientes/solicitudes, y cuándo.

**Criterio de Aceptación**:
- La consulta puede filtrarse por `user_id` (asesor) y rango de fechas.
- Se puede exportar como CSV.

---

## 5. Diseño Técnico

### 5.1 Patrón de Implementación

Se propone el patrón **Audit Log Table** (también conocido como *Shadow Table* o *Change Log*), que es la solución más pragmática para el stack actual (SQLModel + PostgreSQL) sin requerir infraestructura adicional (Kafka, CDC, etc.).

**Ventajas sobre Event Sourcing o CDC para este caso:**
- Sin infraestructura adicional.
- Compatible con el ORM actual (SQLModel/SQLAlchemy 2.0).
- Implementable mediante un servicio centralizado con detección de diff en la capa de servicio.
- Reversible y auditable desde SQL puro.

### 5.2 Modelo de Datos — Nueva Tabla `audit_logs`

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    -- Identificación de la entidad auditada
    entity_type     VARCHAR(100)  NOT NULL,  -- 'customer', 'customer_detail', 'loan_application', etc.
    entity_id       INTEGER       NOT NULL,  -- ID del registro modificado
    -- Identificación del campo
    field_name      VARCHAR(255)  NOT NULL,  -- Nombre del campo modificado
    -- Valores
    old_value       TEXT,                    -- Valor anterior (serializado como string)
    new_value       TEXT,                    -- Valor nuevo (serializado como string)
    -- Actor del cambio
    changed_by_user_id  INTEGER,            -- FK -> users.id (NULL si es sistema)
    changed_by_source   VARCHAR(100) NOT NULL DEFAULT 'manual',
    --  'manual' | 'csv_import' | 'public_form' | 'system' | 'creditgraph_ai'
    -- Contexto
    action          VARCHAR(50)   NOT NULL,  -- 'update' | 'create' | 'delete'
    change_reason   TEXT,                    -- Opcional: justificación del cambio
    session_id      VARCHAR(255),            -- JWT jti o session identifier
    ip_address      VARCHAR(45),             -- IP del cliente (IPv4/IPv6)
    -- Timestamp inmutable
    changed_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_logs (changed_by_user_id);
CREATE INDEX idx_audit_time   ON audit_logs (changed_at DESC);
CREATE INDEX idx_audit_field  ON audit_logs (entity_type, field_name);
```

**Modelo SQLModel correspondiente:**

```python
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: int | None = Field(default=None, primary_key=True)
    entity_type: str = Field(max_length=100)
    entity_id: int
    field_name: str = Field(max_length=255)
    old_value: str | None = Field(default=None)
    new_value: str | None = Field(default=None)
    changed_by_user_id: int | None = Field(default=None, foreign_key="users.id")
    changed_by_source: str = Field(default="manual", max_length=100)
    action: str = Field(max_length=50)  # 'update' | 'create' | 'delete'
    change_reason: str | None = Field(default=None)
    session_id: str | None = Field(default=None, max_length=255)
    ip_address: str | None = Field(default=None, max_length=45)
    changed_at: datetime = Field(default_factory=datetime.utcnow)
```

> **Nota de diseño**: La tabla `audit_logs` es de solo inserción (*append-only*). No se permiten `UPDATE` ni `DELETE` sobre ella. Esto se refuerza a nivel de base de datos con políticas de Row-Level Security (RLS) en PostgreSQL.

---

### 5.3 Entidades Auditadas y Campos por Entidad

| Entidad (`entity_type`) | Tabla | Campos Auditados |
|---|---|---|
| `customer` | `customers` | `lead_channel`, `is_referred`, `referred_by`, `is_active`, `portfolio_id`, `promoter_id` |
| `customer_detail` | `customer_details` | `first_name`, `last_name`, `email`, `birthday`, `gender`, `marital_status`, `education_level`, `nationality`, `housing_type`, `housing_possession_type`, `move_in_date`, `mode_of_transport` |
| `customer_financial_info` | `customer_financial_info` | `other_incomes`, `discounts`, `monthly_housing_payment`, `total_debts`, `loan_installments`, `household_expenses`, `labor_benefits`, `guarantee_assets`, `total_incomes` |
| `customer_job_info` | `customer_job_info` | `is_self_employed`, `occupation_type`, `role`, `level`, `start_date`, `salary`, `other_incomes`, `payment_type`, `payment_frequency`, `payment_bank`, `schedule` |
| `customer_reference` | `customer_references` | Todos los campos de contacto |
| `customer_vehicle` | `customer_vehicles` | Todos los campos del vehículo |
| `loan_application` | `loan_applications` | `status`, `user_id`, `is_answered`, `is_approved`, `is_rejected`, `is_archived` |
| `loan_application_detail` | `loan_application_details` | `amount`, `term`, `rate`, `quota`, `frequency`, `purpose` |

**Campos excluidos de auditoría** (no tienen valor de negocio en el historial):
- `id`, `created_at`, `updated_at` (en todos los modelos)
- Campos de credenciales o hashes

---

### 5.4 Mecanismo de Captura de Cambios

Se implementará un **servicio de auditoría centralizado** (`AuditService`) que captura cambios explícitamente desde la capa de servicio, comparando el estado antes y después de cada actualización.

**Arquitectura propuesta:**

```
Request (HTTP)
    │
    ▼
Endpoint (FastAPI)
    │ usa CurrentUser + AuditContext
    ▼
Service Layer (e.g., CustomerService.update())
    │ detecta old_value vs new_value
    ▼
AuditService.log_changes(entity, old_data, new_data, context)
    │
    ▼
audit_logs (tabla append-only en PostgreSQL)
```

**Estrategia de implementación — Detección manual en Service Layer (MVP):**

El `CustomerService` y `LoanApplicationService` realizarán una lectura del estado actual antes de aplicar la actualización, compararán campo a campo y registrarán las diferencias en `audit_logs`. Esto requiere refactorizar los servicios existentes.

```python
# Ejemplo conceptual en CustomerService
async def update_customer_detail(
    session: Session,
    customer_id: int,
    update_data: CustomerDetailUpdateSchema,
    audit_ctx: AuditContext,
) -> CustomerDetail:
    existing = session.get(CustomerDetail, customer_id)
    changes = diff_models(existing, update_data)  # Helper function

    for field, (old_val, new_val) in changes.items():
        audit_service.log(
            session=session,
            entity_type="customer_detail",
            entity_id=existing.id,
            field_name=field,
            old_value=str(old_val),
            new_value=str(new_val),
            context=audit_ctx,
        )

    # Aplicar la actualización
    existing.sqlmodel_update(update_data.model_dump(exclude_unset=True))
    session.add(existing)
    return existing
```

---

### 5.5 Contexto de Auditoría (`AuditContext`)

Se crea un objeto de contexto inmutable que se propaga desde el endpoint al servicio:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class AuditContext:
    user_id: int | None          # None si es proceso de sistema
    source: str                  # 'manual' | 'csv_import' | 'public_form' | 'system'
    ip_address: str | None       # Desde Request.client.host
    session_id: str | None       # JWT jti claim
    reason: str | None = None    # Justificación opcional
```

Este contexto se inyecta como dependencia FastAPI:

```python
# En deps.py
async def get_audit_context(
    request: Request,
    current_user: CurrentUser,
) -> AuditContext:
    return AuditContext(
        user_id=current_user.id,
        source="manual",
        ip_address=request.client.host,
        session_id=extract_jti(request),
    )
```

Para procesos automáticos (importación CSV), el contexto se crea explícitamente:

```python
csv_audit_ctx = AuditContext(
    user_id=None,
    source="csv_import",
    ip_address=None,
    session_id=None,
    reason=f"Batch import from file: {filename}",
)
```

---

### 5.6 API Endpoints de Consulta (Nuevos)

#### `GET /api/v1/audit/customers/{customer_id}`

Retorna el historial de cambios de un cliente y todas sus sub-entidades.

**Query Params:**
- `entity_type`: Filtrar por sub-entidad (ej. `customer_detail`, `customer_financial_info`)
- `field_name`: Filtrar por campo específico
- `changed_by_user_id`: Filtrar por actor
- `date_from` / `date_to`: Rango de fechas
- `page` / `page_size`: Paginación (default: 50)

**Response:**
```json
{
  "total": 42,
  "page": 1,
  "items": [
    {
      "id": 1001,
      "entity_type": "customer_detail",
      "entity_id": 15,
      "field_name": "email",
      "old_value": "juan@gmail.com",
      "new_value": "juanperez@empresa.com",
      "changed_by": {
        "user_id": 7,
        "username": "advisor01",
        "full_name": "María López"
      },
      "source": "manual",
      "ip_address": "192.168.1.10",
      "action": "update",
      "changed_at": "2026-07-28T14:32:11Z"
    }
  ]
}
```

---

#### `GET /api/v1/audit/loan-applications/{loan_id}`

Retorna el historial de cambios de una solicitud de préstamo.

**Query Params:** (mismos que el endpoint de clientes)

---

#### `GET /api/v1/audit/users/{user_id}/activity`

Retorna toda la actividad de modificación de un asesor/usuario específico.  
**Acceso restringido**: Solo `admin` o `supervisor`.

**Query Params:**
- `date_from` / `date_to`
- `entity_type`
- `page` / `page_size`

---

#### `GET /api/v1/audit/customers/{customer_id}/field-timeline/{field_name}`

Retorna la evolución histórica de un campo específico de un cliente.

**Response:**
```json
{
  "entity_type": "customer_detail",
  "entity_id": 15,
  "field_name": "email",
  "timeline": [
    { "value": null, "changed_at": "2026-01-10T09:00:00Z", "source": "public_form", "action": "create" },
    { "value": "juan@gmail.com", "changed_at": "2026-03-15T11:20:00Z", "source": "manual", "changed_by": "María López" },
    { "value": "juanperez@empresa.com", "changed_at": "2026-07-28T14:32:11Z", "source": "csv_import" }
  ]
}
```

---

### 5.7 Seguridad y Permisos

> **Decisión (PO 2026-07-31)**: El acceso al audit log está restringido exclusivamente a roles de supervisión y administración. Los asesores **nunca** tienen acceso al historial de cambios, ni siquiera de sus propios clientes.

| Endpoint | Roles permitidos |
|---|---|
| `GET /audit/customers/{id}` | `admin`, `supervisor` |
| `GET /audit/loan-applications/{id}` | `admin`, `supervisor` |
| `GET /audit/users/{id}/activity` | `admin`, `supervisor` |
| `GET /audit/.../field-timeline/...` | `admin`, `supervisor` |

**Protecciones adicionales:**
- **RLS desde el MVP**: La tabla `audit_logs` tendrá una política Row-Level Security en PostgreSQL desde la primera iteración, permitiendo solo `INSERT` y `SELECT`. Los roles de aplicación (`lamas_app`) no tendrán permisos `UPDATE` ni `DELETE` sobre esta tabla.
- Los valores de campos financieros sensibles (ej. `salary`, `total_incomes`) serán **ofuscados parcialmente** en la respuesta de la API para el rol `supervisor`; solo `admin` ve valores completos.
- El `ip_address` solo se expone al rol `admin`.
- Los endpoints de auditoría requieren autenticación JWT válida y verificación de rol en cada request (no solo en el middleware global).

---

### 5.8 Consideraciones de Rendimiento

| Preocupación | Mitigación |
|---|---|
| Volumen de registros | Índices en `entity_type`, `entity_id`, `changed_at` y `changed_by_user_id` |
| Retención obligatoria 10 años (Ley 183-02 RD) | Tabla `audit_logs` activa conserva registros de los últimos **5 años**. Registros de 5-10 años se mueven a `audit_logs_archive` (misma estructura, partición por año). Ambas tablas son consultables desde la API. |
| Costo de escritura en cada update | Escritura asíncrona mediante `BackgroundTask` de FastAPI; la respuesta HTTP no espera la confirmación del audit log |
| Consultas lentas en historial largo | Paginación obligatoria (max 100 items/página) + cursor-based pagination en v2 |

---

## 6. Entidades No Auditadas (Justificación)

| Entidad | Razón de exclusión |
|---|---|
| `users` | Tiene su propio log de autenticación |
| `portfolios`, `promoters` | Cambios infrecuentes; se documentan en `docs/decisions/` |
| `legal_consent` | Inmutable por diseño (no se actualiza) |
| `creditgraph_analysis` | Inmutable por diseño (solo INSERT) |
| `audit_logs` | La tabla de auditoría no se audita a sí misma |

---

## 7. Plan de Implementación por Fases

### Fase 1 — Fundación (Sprint 1-2)
- [ ] Crear modelo SQLModel `AuditLog` y script de migración DDL.
- [ ] Implementar `AuditContext` dataclass y dependencia FastAPI `get_audit_context`.
- [ ] Implementar `AuditService` con métodos `log()` y `log_changes()`.
- [ ] Implementar helper `diff_models()` para comparar dos instancias SQLModel.
- [ ] Integrar en `CustomerService.update_customer()` y sub-entidades.
- [ ] Integrar en `LoanApplicationService.update()` y cambios de `status`.

### Fase 2 — API de Consulta (Sprint 3)
- [ ] Implementar endpoints GET de consulta (`/audit/customers/`, `/audit/loan-applications/`).
- [ ] Implementar endpoint de actividad por usuario (`/audit/users/{id}/activity`).
- [ ] Implementar endpoint de timeline por campo (`/audit/.../field-timeline/...`).
- [ ] Aplicar políticas RLS en PostgreSQL sobre `audit_logs`.

### Fase 3 — Integración con Procesos Automáticos (Sprint 4)
- [ ] Propagar `AuditContext` con `source='csv_import'` en `import_csv.py`.
- [ ] Propagar `AuditContext` con `source='public_form'` en el endpoint de creación desde formulario público.
- [ ] Integrar con `task_queue` para registrar cambios de procesos background.

### Fase 4 — UI de Historial (Sprint 5-6)
- [ ] Componente `AuditTimeline` en el frontend Next.js.
- [ ] Vista de historial en el perfil del cliente.
- [ ] Vista de historial en el detalle de `LoanApplication`.
- [ ] Exportación de historial en CSV.

---

## 8. Esquema de Directorios — Nuevos Archivos

```
backend/app/
├── models/
│   └── audit_log.py                  # [NUEVO] Modelo SQLModel AuditLog
├── schemas/
│   └── audit.py                      # [NUEVO] Schemas Pydantic para respuesta de API
├── services/
│   └── audit_service.py              # [NUEVO] AuditService + diff_models()
├── api/v1/
│   ├── endpoints/
│   │   └── audit.py                  # [NUEVO] Endpoints GET de auditoría
│   └── deps.py                       # [MODIFICAR] Agregar get_audit_context()
└── core/
    └── audit_context.py              # [NUEVO] Dataclass AuditContext

backend/scripts/
└── add_audit_logs_table.sql          # [NUEVO] Script DDL + índices + RLS

docs/
└── planning/
    └── prd-audit-versioning.md       # [ESTE ARCHIVO]
```

**Archivos existentes a modificar:**
- `backend/app/services/customer_service.py` — Integrar AuditService en métodos de update.
- `backend/app/services/loan_application_service.py` — Integrar AuditService en métodos de update y cambio de estado.
- `backend/app/api/v1/endpoints/import_csv.py` — Propagar AuditContext con `source='csv_import'`.
- `backend/app/api/v1/router.py` — Registrar el nuevo router `audit`.

---

## 9. Pruebas Requeridas

### 9.1 Pruebas Unitarias (`pytest`)

| Caso de prueba | Cobertura |
|---|---|
| `test_diff_models_detects_changes` | `diff_models()` identifica campos cambiados correctamente |
| `test_diff_models_ignores_timestamps` | `created_at`/`updated_at` no generan entradas de audit |
| `test_audit_service_logs_single_field` | Un cambio de campo → 1 entrada en `audit_logs` |
| `test_audit_service_logs_multiple_fields` | N cambios simultáneos → N entradas en `audit_logs` |
| `test_audit_context_manual_source` | `AuditContext` se construye correctamente desde JWT |
| `test_audit_context_csv_source` | `AuditContext` con `source='csv_import'` |
| `test_no_audit_log_if_no_changes` | Si no hay cambios, no se inserta nada en `audit_logs` |

### 9.2 Pruebas de Integración

| Caso de prueba | Cobertura |
|---|---|
| `test_put_customer_creates_audit_entries` | `PUT /customers/{id}` → entradas en `audit_logs` |
| `test_patch_status_creates_audit_entry` | `PATCH /loan-applications/{id}/status` → entrada de status |
| `test_csv_import_audit_source` | Importación CSV marca `source='csv_import'` |
| `test_get_customer_audit_log` | `GET /audit/customers/{id}` retorna historial correcto |
| `test_audit_log_is_immutable` | No se puede `DELETE`/`UPDATE` en `audit_logs` (RLS) |
| `test_field_timeline_order` | Timeline de campo ordenado cronológicamente |

### 9.3 Comando de Ejecución

```bash
# Ejecutar suite de pruebas de auditoría
cd backend && uv run pytest tests/test_audit/ -v --cov=app/services/audit_service --cov-report=term-missing
```

---

## 10. Métricas de Éxito

| Métrica | Valor Objetivo |
|---|---|
| Cobertura de campos auditados | ≥ 95% de campos de `Customer` y `LoanApplication` |
| Latencia adicional por `PUT`/`PATCH` | < 50ms adicionales (escritura de audit en background) |
| Cobertura de pruebas del módulo `audit` | ≥ 85% |
| Tiempo de respuesta de `GET /audit/customers/{id}` | < 300ms para historial de 1,000 entradas |
| Integridad de datos | 0 entradas de audit modificadas o eliminadas post-inserción |

---

## 11. Riesgos e Impedimentos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Volumen acumulado de audit_logs en 10 años | Alta | Medio | Estrategia de particionamiento activo/archivo desde el primer deploy; job cron anual de migración |
| Degradación de rendimiento en imports masivos (CSV) | Media | Alto | Escritura de audit en `BackgroundTask` asíncrono; la respuesta del import no bloquea en audit |
| Contexto de usuario no disponible en algunos flujos | Media | Alto | `AuditContext` es requisito obligatorio en todos los servicios; error 500 si no se puede construir |
| Ausencia de Alembic dificulta la migración DDL | Baja | Medio | Script SQL manual `add_audit_logs_table.sql` cubre el MVP; adoptar Alembic es deuda técnica pendiente |
| Reversión de datos basada en historial (scope creep) | Alta (demanda) | Bajo | Explícitamente fuera del MVP; documentar en ROADMAP como feature v2 |

---

## 12. Decisiones Tomadas (PO — 2026-07-31)

> Todas las preguntas abiertas han sido resueltas. El PRD está **aprobado** y listo para generar `implementation.md`.

| # | Pregunta | Decisión | Impacto en Diseño |
|---|---|---|---|
| 1 | ¿Qué actores acceden al audit log? | Solo `admin` y `supervisor`. Los asesores **nunca** tienen acceso. | La tabla de permisos de la sección 5.7 fue actualizada. No se expone ningún endpoint de audit a rol `advisor`. |
| 2 | ¿Notificaciones en tiempo real por cambios críticos? | **No** para el MVP. | Eliminar de scope. El campo `ip_address` y la tabla `audit_logs` son suficientes para revisión posterior. |
| 3 | ¿Auditar `action='create'` (creación inicial)? | **No.** Solo se auditan actualizaciones (`action='update'`) y borrados lógicos (`action='soft_delete'`). | El helper `diff_models()` solo se invoca desde los endpoints `PUT`/`PATCH`. La creación inicial queda registrada en `created_at` del modelo. El `action` en el modelo solo acepta los valores: `update` \| `soft_delete`. |
| 4 | ¿`change_reason` obligatorio en cambios de estado? | **No.** El campo `change_reason` permanece opcional en el modelo `AuditLog`. | No se requiere validación de campo obligatorio en los endpoints de cambio de estado de `LoanApplication`. |
| 5 | Política de retención de datos | **10 años** según normativas complementarias de prevención de riesgos y debida diligencia en RD (Ley 183-02 y regulaciones ABA/AMLCO). Estrategia: 5 años en tabla activa `audit_logs` + 5 años en tabla de archivo `audit_logs_archive`. | La sección 5.8 fue actualizada con la estrategia de archivado por partición anual. |
| 6 | ¿RLS de PostgreSQL desde el MVP? | **Sí.** La política RLS es un requisito de seguridad del MVP, no una mejora futura. | La Fase 1 (Sprint 1-2) incluye la creación de la política RLS como parte del script DDL `add_audit_logs_table.sql`. |

---

## Referencias

- [customer.py](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/models/customer.py)
- [loan_application.py](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/models/loan_application.py)
- [customers.py (endpoint)](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/customers.py)
- [loan_applications.py (endpoint)](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/backend/app/api/v1/endpoints/loan_applications.py)
- [ROADMAP.md](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/ROADMAP.md)
- [status-report.md](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/docs/status-report.md)

---

*Este PRD fue generado a partir de una auditoría técnica del codebase realizada el 2026-07-31.*  
*Decisiones del PO incorporadas el 2026-07-31. Estado: **Aprobado**.*  
*Siguiente paso: Generar `docs/implementation/impl-audit-versioning.md` con el plan técnico sprint a sprint.*

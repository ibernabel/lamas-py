# Documento de Requerimientos: Rediseño de Estructura de Tabla de Solicitudes (/loans)

**Tipo**: Documento de Requerimientos Técnicos y Arquitectura  
**Fecha**: 2026-07-31  
**Autor**: Antigravity (AI Architect) / Idequel Bernabel  
**Estado**: ✅ Completado e Implementado  

---

## 1. Objetivo

Establecer la especificación funcional, de experiencia de usuario y de arquitectura para **rediseñar la tabla de solicitudes de préstamos** en la vista `/loans` del sistema **LAMaS** (`technology/projects/aisa/lamas-py`).

El objetivo principal es estructurar la información clave de cada solicitud en **7 columnas legibles y compuestas**, integrando texto principal con subtítulos en tamaño reducido ("mini" / `text-xs text-muted-foreground`), emulando la narrativa operativa optimizada de la plataforma SoliPres adaptada a LAMaS.

---

## 2. Comparativa Narrativa de Plataformas

### A. Narrativa SoliPres (Referencia Origen)
> *"En esta fecha, esta persona, con este celular, que trabaja en esta empresa y cobra por este banco, solicita este préstamo, está asignada a este asesor. Se encuentra en este estatus, llevamos estas notas, y puedes hacer estas acciones ahora mismo."*

### B. Narrativa LAMaS (Especificación Objetivo)
> *"En esta fecha, esta persona (con cédula en texto mini debajo), solicitó esta cantidad. Esta persona trabaja en esta empresa y cobra por este banco (en texto mini debajo del nombre de la empresa). Actualmente está en este estatus, manejado por este asesor (en texto mini debajo). Actualmente llevamos estas notas. En este momento puedes ver o editar (agregar botón de editar)."*

---

## 3. Especificación de Columnas y Encabezados

La tabla de solicitudes en `/loans` adoptará exactamente la siguiente estructura de 7 columnas:

| # | Encabezado | Elemento Principal (Línea 1) | Elemento Subterráneo / Mini (Línea 2) | Estilo Mini |
|---|---|---|---|---|
| 1 | **Fecha** | Fecha de creación de la solicitud (`created_at`) | — | `text-sm text-muted-foreground` |
| 2 | **Nombre + Cédula (mini)** | Nombre completo del cliente (`customer_name`) | Número de Cédula (`customer_nid`) | `text-[10px] text-muted-foreground font-mono` |
| 3 | **Monto** | Monto solicitado (`amount` formateado en DOP) | — | `font-medium text-foreground` |
| 4 | **Empresa + Banco (mini)** | Nombre de la empresa (`company_name`) | Banco de cobro/nómina (`bank_name`) | `text-xs text-muted-foreground` |
| 5 | **Estatus + Asesor (mini)** | Badge de estado del préstamo (`LoanStatusBadge`) | Asesor / Usuario asignado (`advisor_name`) | `text-xs text-muted-foreground` |
| 6 | **Notas** | Última nota registrada o extracto de observaciones (`latest_note`) | — | `text-xs text-muted-foreground line-clamp-1` |
| 7 | **Acciones** | Botón **Ver** (Icono Ojo) | Botón **Editar** (Icono Lápiz / Edit) | `flex gap-1 items-center justify-end` |

---

## 4. Arquitectura y Cambios Técnicos

### 4.1. Backend (FastAPI + SQLModel)

1. **Modelos y DTOs (`backend/app/schemas/loan_application.py`)**:
   - Ampliar `LoanApplicationListItem` para incluir los siguientes campos:
     ```python
     company_name: str | None = None
     bank_name: str | None = None
     advisor_name: str | None = None
     latest_note: str | None = None
     ```

2. **Capa de Servicios (`backend/app/services/loan_application_service.py`)**:
   - En `list_loan_applications`, realizar joins / eager loading eficientes para obtener:
     - `company_name`: `customer.company.name` o `customer.job_info.company_name`.
     - `bank_name`: `customer.job_info.payment_bank` o primer banco registrado.
     - `advisor_name`: `User.name` donde `User.id == loan.user_id`.
     - `latest_note`: Contenido de la nota más reciente en `LoanApplicationNote`.

### 4.2. Frontend (Next.js 16 + React 19 + Tailwind v4)

1. **Tipos TypeScript (`frontend/lib/api/types.ts`)**:
   - Actualizar la interfaz `LoanApplicationListItem` con las nuevas propiedades opcionales.

2. **Componente de Tabla (`frontend/components/loans/LoanTable.tsx`)**:
   - Reestructurar el `TableHeader` y `TableBody` para renderizar las 7 columnas.
   - Aplicar jerarquía visual con subtextos mini (`text-xs` / `text-[10px]`) debajo del título principal en Nombre, Empresa y Estatus.
   - Agregar el botón **Editar** en la columna de Acciones (que abre modal de edición de préstamo o redirige a la vista de edición).

3. **Internacionalización (`frontend/lib/i18n/locales/*.json`)**:
   - Agregar claves i18n para los encabezados combinados (`loans.table.companyBank`, `loans.table.statusAdvisor`, `loans.table.notes`, etc.).

---

## 5. Plan de Archivos Impactados

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/planning/req-loans-table-structure-redesign.md` | [NEW] | Documento de requerimiento SSOT |
| `ROADMAP.md` | [MODIFY] | Registro de la nueva fase/tarea en el Roadmap oficial |
| `backend/app/schemas/loan_application.py` | [MODIFY] | Extensión de `LoanApplicationListItem` con nuevos campos |
| `backend/app/services/loan_application_service.py` | [MODIFY] | Carga de empresa, banco, asesor y última nota en listado |
| `frontend/lib/api/types.ts` | [MODIFY] | Actualización de tipos TypeScript |
| `frontend/components/loans/LoanTable.tsx` | [MODIFY] | Rediseño de columnas y celda de acciones (Ver + Editar) |
| `frontend/lib/i18n/locales/es.json` | [MODIFY] | Claves i18n en español para tabla de solicitudes |
| `frontend/lib/i18n/locales/en.json` | [MODIFY] | Claves i18n en inglés para tabla de solicitudes |

---

## 6. Criterios de Aceptación

- [ ] La tabla en `/loans` muestra exactamente 7 columnas: `Fecha`, `Nombre + Cédula (mini)`, `Monto`, `Empresa + Banco (mini)`, `Estatus + Asesor (mini)`, `Notas` y `Acciones`.
- [ ] La cédula se muestra en tamaño mini debajo del nombre del cliente.
- [ ] El banco se muestra en tamaño mini debajo del nombre de la empresa.
- [ ] El nombre del asesor se muestra en tamaño mini debajo del badge de estatus.
- [ ] La columna de notas muestra el extracto o texto de la última nota disponible.
- [ ] La columna de acciones contiene tanto el botón **Ver** como el botón **Editar**.
- [ ] Pruebas unitarias de frontend (`LoanTable.test.tsx`) y backend (`test_loan_applications.py`) actualizadas y pasando al 100%.

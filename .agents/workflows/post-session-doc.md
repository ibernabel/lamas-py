---
description: Guía al agente en la creación y actualización de documentación dentro de docs/ (SSOT) de LAMaS al finalizar una sesión de trabajo.
---

# Workflow: Documentación de Fin de Sesión (Post-Session Doc — LAMaS)

## Descripción
Este workflow guía al agente o desarrollador en la auditoría y actualización del directorio `docs/` y del `ROADMAP.md` del proyecto **LAMaS** (`technology/projects/aisa/lamas-py`) al finalizar una sesión de trabajo. Mantiene la **Única Fuente de Verdad (SSOT)** del proyecto actualizada con cambios en el backend (FastAPI/SQLModel), frontend (Next.js 16/shadcn), integraciones (CreditGraph AI) y configuraciones de infraestructura/Docker.

---

## Disparador (When to run)
Ejecutar este workflow inmediatamente al **concluir una sesión de trabajo en el proyecto LAMaS**, previo a o durante el proceso de sincronización final (`/sync-repo`) con Git.

---

## Roles Asociados (ASD Framework)
- **QA / Technical Writer:** Auditor de los cambios realizados, verificación de pruebas (`pytest` / `npm test`) y redacción técnica en `docs/`.
- **Architect:** Validador de decisiones de diseño (ADRs), preservación de principios SOLID/KISS/DRY y alineación con la matriz de decisión de préstamos y la migración desde Laravel.

---

## Pasos del Workflow

### Paso 1: Auditoría de Cambios en LAMaS
Analizar los cambios específicos dentro del proyecto `lamas-py` ejecutando los siguientes comandos en el entorno WSL (Ubuntu):

```bash
# 1. Inspect git status in lamas-py directory
git status technology/projects/aisa/lamas-py/

# 2. Inspect modified files summary
git diff --stat technology/projects/aisa/lamas-py/

# 3. Inspect recent commits related to lamas-py
git log -n 5 --oneline -- technology/projects/aisa/lamas-py/
```

Clasificar la actividad realizada durante la sesión en una o más de las siguientes categorías:
1. **Nuevas Funcionalidades o Fases** (`docs/implementation/`)
2. **Corrección de Bugs / Fixes** (`docs/fixes/`)
3. **Decisiones de Arquitectura / ADRs** (`docs/decisions/`)
4. **Pruebas y Verificaciones** (`docs/testing/`)
5. **Conocimientos Aprendidos / Problemas Conocidos** (`docs/knowledges/`)

---

### Paso 2: Generar Documentación Específica

> **Nomenclatura**: Usar `snake_case` o `kebab-case` en minúsculas sin acentos ni caracteres especiales (ej. `phase-5-frontend-customers.md` o `fix_2026_03_10_document_viewer.md`), acorde a los estándares de `docs/`.

#### Opción A: Documentar Implementaciones o Fases (`docs/implementation/`)
Si durante la sesión se desarrolló un nuevo endpoint, componente de UI, migración o fase del roadmap:

1. Crear el archivo `docs/implementation/YYYY-MM-DD-[feature-name].md` (o `phase-[N]-[name].md`).
2. Estructura requerida:
   - **Objetivo:** Breve descripción del alcance y propósito del cambio en LAMaS.
   - **Componentes Afectados:** Lista de archivos en `backend/app/...`, `frontend/src/...`, esquemas de BD, Docker, etc.
   - **Detalles Técnicos:** Clases SQLModel, endpoints FastAPI, hooks/componentes Next.js, esquemas Zod o integraciones con `aisa`.
   - **Pruebas de Verificación:** Comandos y resultados de validación (`pytest`, `npm test`, llamadas HTTP manuales).

#### Opción B: Documentar Fixes y Correcciones (`docs/fixes/`)
Si durante la sesión se solucionó un error o fallo técnico:

1. Crear el archivo `docs/fixes/fix_YYYY_MM_DD_[bug_description].md`.
2. Estructura requerida:
   - **Síntoma:** Error reportado (tracebacks de Python/FastAPI, errores de hidratación/Next.js, fallos de conexión Docker/Postgres).
   - **Causa Raíz:** Diagnóstico técnico del origen del problema.
   - **Solución Aplicada:** Cambios realizados y justificación de los ajustes.
   - **Archivos Modificados:** Lista de archivos impactados.
   - **Verificación:** Pruebas unitarias o de integración ejecutadas para confirmar el fix.

#### Opción C: Documentar Decisiones de Arquitectura (`docs/decisions/`)
Si se tomó una decisión estructural (cambios en el esquema de base de datos, autenticación NextAuth/FastAPI, patrones de UI o arquitectura de servicios):

1. Crear el archivo `docs/decisions/ADR_XXX_[decision_title].md` (donde XXX es el número correlativo).
2. Estructura requerida:
   - **Estado:** Propuesto | Aprobado | Reemplazado
   - **Contexto:** Problema o necesidad técnica/negocio que motivó la decisión.
   - **Decisión:** La alternativa seleccionada y su justificación.
   - **Consecuencias:** Impactos positivos, trade-offs y consideraciones a futuro.

#### Opción D: Reportar Pruebas o Conocimientos (`docs/testing/` o `docs/knowledges/`)
Si se realizaron pruebas de regresión, verificaciones de UI/Viewer o se documentó un problema conocido de entorno:

1. Crear el archivo en `docs/testing/[verification-name].md` o `docs/knowledges/[known-issue-name].md`.

---

### Paso 3: Actualizar el SSOT (`docs/README.md`, `docs/status-report.md` y `ROADMAP.md`)

Una vez generada la documentación específica:

1. **Actualizar `docs/README.md`:**
   - Registrar el nuevo documento en la sección correspondiente (`Planning`, `Implementation Phases`, `Testing`, `Knowledges & Issues`).
   - Usar formato de enlaces relativos (`[Título](./subdirectorio/archivo.md)`).

2. **Actualizar `docs/status-report.md`:**
   - Actualizar la fecha del informe si se registraron avances significativos.
   - Actualizar el estado de los componentes (`Backend FastAPI`, `Frontend Next.js`, `CreditGraph AI Engine`).
   - Reflejar los logros recientes en la sección del resumen ejecutivo.

3. **Actualizar `ROADMAP.md` (si aplica):**
   - Actualizar el estado de las fases o entregables (ej. cambiar de `🟡 In Progress` a `✅ Complete`).

---

### Paso 4: Verificación Final e Integridad

Ejecutar las comprobaciones antes de finalizar la sesión:

```bash
# 1. Verificar estado de los archivos en docs/
git status technology/projects/aisa/lamas-py/docs/

# 2. Ejecutar suite de pruebas del Backend FastAPI (opcional si se modificó backend)
cd technology/projects/aisa/lamas-py/backend && pytest

# 3. Ejecutar verificación de linter/build del Frontend (opcional si se modificó frontend)
cd technology/projects/aisa/lamas-py/frontend && npm run lint
```

- Validar que no existan credenciales, secretos ni tokens en los archivos creados (uso de `.env`).
- Confirmar la coherencia idiomática: documentación técnica en español y código/variables/comentarios en inglés.
- Proceder con la sincronización usando `/sync-repo`.

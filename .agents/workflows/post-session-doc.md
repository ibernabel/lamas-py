---
description: Guía al agente en la creación y actualización de documentación dentro de docs/ (SSOT) al finalizar una sesión de trabajo.
user-invocable: true
---

# Workflow: Documentación de Fin de Sesión (Post-Session Doc)

## Descripción
Este workflow guía al agente o desarrollador en la creación y actualización de archivos de documentación dentro del directorio `docs/` al finalizar una sesión de trabajo. El objetivo es mantener una **Única Fuente de Verdad (SSOT)** actualizada con todos los cambios, implementaciones, soluciones de fallos (fixes) y decisiones de arquitectura tomadas.

---

## Disparador (When to run)
Ejecutar este workflow inmediatamente al **concluir una sesión de trabajo**, previo a o durante el proceso de sincronización (`repo-sync.md`) con Git.

---

## Roles Asociados (ASD Framework)
- **QA / Technical Writer:** Encargado de auditar los cambios realizados y redactar la documentación técnica sin omitir detalles de verificación.
- **Architect:** Validador de los Architecture Decision Records (ADRs) y de la preservación de los principios SOLID, KISS y DRY.

---

## Pasos del Workflow

### Paso 1: Auditoría de la Sesión
Analizar el historial y el estado de la sesión de trabajo ejecutando los siguientes comandos:

```bash
# 1. Inspect status of modified and untracked files
git status

# 2. Review summary of line and file changes
git diff --stat

# 3. Review recent commits in current session
git log -n 5 --oneline
```

Identificar los componentes modificados y clasificarlos en una o más de las siguientes categorías:
1. **Nueva Implementación / Refactorización** (`docs/implementation/`)
2. **Corrección de Errores / Bugs** (`docs/fixes/`)
3. **Decisiones de Arquitectura** (`docs/decisions/`)

---

## Paso 2: Generar Documentación Específica

### Opción A: Documentar Implementaciones (`docs/implementation/`)
Si durante la sesión se creó una nueva funcionalidad, módulo o refactorización arquitectónica:

1. Crear el archivo `docs/implementation/YYYY-MM-DD-[nombre-feature].md`.
2. Estructura requerida:
   - **Objetivo:** Breve descripción del alcance y propósito.
   - **Componentes Afectados:** Lista de archivos creados/modificados.
   - **Detalles Técnicos:** Clases, funciones, esquemas o APIs expuestas.
   - **Pruebas de Verificación:** Comandos y resultados de validación.

### Opción B: Documentar Fixes y Correcciones (`docs/fixes/`)
Si durante la sesión se solucionó un error o vulnerabilidad:

1. Crear el archivo `docs/fixes/FIX-YYYY-MM-DD-[descripcion-bug].md`.
2. Estructura requerida:
   - **Síntoma:** Error reportado (logs, tracebacks o comportamiento anómalo).
   - **Causa Raíz:** Diagnóstico técnico del origen del problema.
   - **Solución Aplicada:** Cambios realizados y justificación técnica.
   - **Archivos Modificados:** Lista de archivos impactados.
   - **Verificación:** Pruebas unitarias o manuales ejecutadas para confirmar la solución.

### Opción C: Documentar Decisiones de Arquitectura (`docs/decisions/`)
Si se tomó una decisión estructural (cambio de patrón, nueva librería, modificación de esquema de BD):

1. Crear el archivo `docs/decisions/ADR-XXX-[titulo-decision].md` (donde XXX es un correlativo numérico, ej: ADR-001).
2. Estructura requerida:
   - **Estado:** Propuesto | Aprobado | Reemplazado
   - **Contexto:** Problema o necesidad que motivó la decisión.
   - **Decisión:** La alternativa seleccionada y por qué.
   - **Consecuencias:** Impacto positivo y negativo de la decisión.

---

## Paso 3: Actualizar el SSOT (`docs/README.md`)

Una vez generados los documentos individuales:

1. **Actualizar `docs/README.md`:**
   - Agregar el enlace markdown al nuevo documento en la sección correspondiente (`Implementation`, `Bug Fixes`, `Decisions`).
   - Mantener el formato estándar de enlaces relativos (`[Título](./subdirectorio/archivo.md)`).

2. **Actualizar `ROADMAP.md` (si aplica):**
   - Marcar tareas completadas (`[x]`) y actualizar el porcentaje de avance.

---

## Paso 4: Verificación de Integridad

Confirmar que la documentación creada esté completa y no contenga secretos ni PII:

```bash
# Check git status to ensure all doc files are staged/tracked
git status
```

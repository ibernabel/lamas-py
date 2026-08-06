# Configuración de Engineering Skills (Matt Pocock Pattern)

- **Fecha:** 2026-08-06
- **Estado:** ✅ Completado
- **Autor / Agente:** Antigravity (ASD Framework)

## Objetivo

Scaffold y configuración de las **engineering skills** para el repositorio LAMaS (`lamas-py`), definiendo el gestor de issues (GitHub Issues), el vocabulario de etiquetas para triage y las reglas de consumo de la documentación de dominio.

## Componentes Afectados

- `docs/agents/issue-tracker.md` [NEW]
- `docs/agents/triage-labels.md` [NEW]
- `docs/agents/domain.md` [NEW]
- `docs/implementation/2026-08-06-setup-matt-pocock-skills.md` [NEW]
- `.agents/AGENTS.md` [MODIFY]
- `docs/README.md` [MODIFY]

## Detalles Técnicos

1. **Issue Tracker (`docs/agents/issue-tracker.md`)**:
   - Configurado para **GitHub Issues** utilizando la CLI `gh`.
   - Convenciones para crear, leer, listar, comentar y cerrar issues.
   - Definición del flujo de wayfinding para `/wayfinder` (map / child tickets / blocking / claim / resolve).

2. **Triage Labels (`docs/agents/triage-labels.md`)**:
   - Mapeo de 5 roles canónicos de triage:
     - `needs-triage` (Evaluación inicial por mantenedor)
     - `needs-info` (Esperando respuesta/información)
     - `ready-for-agent` (Especificado para ejecuciones AFK de agente)
     - `ready-for-human` (Requiere implementación por humano)
     - `wontfix` (Issue descartada)

3. **Domain Docs (`docs/agents/domain.md`)**:
   - Configuración de estructura de contexto único (**single-context**).
   - Reglas de consulta para `CONTEXT.md` y `docs/decisions/` / `docs/adr/`.

4. **Integración con Reglas de Agente (`.agents/AGENTS.md`)**:
   - Añadido el bloque `## Agent skills` haciendo referencia a la configuración técnica en `docs/agents/`.

## Pruebas de Verificación

- Inspección de sintaxis y rutas de archivos creados.
- Verificación de consistencia con las reglas globales y del workspace `.agents/`.

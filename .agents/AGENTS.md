# Proyecto LAMaS — Reglas del Espacio de Trabajo (.agents)

## Dominio: 🏦 Loan Applications Management System (LAMaS)

## Alcance de Ejecución: Modo Planificación (Estricto)

El proyecto **LAMaS** (`technology/projects/aisa/lamas-py`) sigue las reglas del marco de trabajo **ASD** (Architect, Developer, QA, Security) definidas en `technology/.agents/AGENTS.md` y las convenciones globales del espacio de trabajo `consultor`.

## Convenciones de Nomenclatura e Idioma

- **Directorio de Agentes**: `.agents/` (plural) para mantener la consistencia en todas las verticales.
- **Interacción y Documentación**: Español. Toda la documentación técnica (`docs/`), respuestas y planes deben escribirse en español.
- **Código Fuente**: Inglés. Código Python, TypeScript, SQLModel, FastAPI, Next.js, identificadores, variables y docstrings deben ser estrictamente en inglés.
- **Nombres de Archivos**: `snake_case` o `kebab-case` sin espacios, acentos ni caracteres especiales.

## Roles ASD en LAMaS

1. **Arquitecto:** Revisa la arquitectura de migración (Laravel → FastAPI + Next.js), esquemas SQLModel, integración con el motor `CreditGraph AI` (`aisa`) y patrones de diseño (SOLID, KISS, DRY).
2. **Desarrollador:** Implementa la lógica de negocio y APIs RESTful basadas en los requisitos aprobados.
3. **QA:** Diseña y ejecuta pruebas unitarias e integrales (`pytest` para FastAPI, `npm test`/`Playwright` para Next.js).
4. **Seguridad:** Audita la autenticación JWT, middleware NextAuth, sanitización de entradas de usuario y protección de secretos.

## SSOT de Documentación (`docs/`)

Toda la documentación técnica del proyecto reside en `docs/`:
```
docs/
├── README.md
├── status-report.md
├── planning/         (PRD, migración, arquitectura)
├── implementation/   (resúmenes de desarrollo por fase)
├── testing/          (planes y reportes de pruebas)
├── decisions/        (ADRs - Registro de Decisiones de Arquitectura)
├── fixes/            (registros de corrección de bugs)
└── knowledges/       (problemas conocidos y aprendizaje de dominio)
```

## Workflows Disponibles

- `/post-session-doc`: Documentación y auditoría al concluir una sesión de trabajo en LAMaS (`.agents/workflows/post-session-doc.md`).
- `/sync-repo`: Sincronización del repositorio con Git y convenciones de commit.

## Agent skills

### Issue tracker

GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/decisions/`). See `docs/agents/domain.md`.


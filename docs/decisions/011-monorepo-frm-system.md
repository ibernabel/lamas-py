# Arquitectura de repositorio: monorepo `frm-system`

El sistema FRM se organiza como un monorepo único (`frm-system`) que contiene todas las aplicaciones y paquetes compartidos. El desarrollador principal es el único desarrollador del sistema.

## Estructura propuesta

```
frm-system/
├── apps/
│   ├── lamas/              ← backend FastAPI (actual lamas-py/backend)
│   ├── lamas-web/          ← frontend Next.js (actual lamas-py/frontend)
│   ├── creditgraph/        ← motor de análisis de crédito (actual aisa/creditgraph)
│   └── frm-chats/          ← capa conversacional (nuevo)
├── packages/
│   └── frm-contracts/      ← tipos y contratos compartidos entre apps
│       ├── python/         ← Pydantic schemas compartidos
│       └── typescript/     ← TypeScript interfaces compartidas
└── docker-compose.yml      ← orquestación completa del sistema
```

## Considered Options

- **Polyrepo con contratos explícitos**: Repos separados (`lamas-py`, `creditgraph`, `frm-chats`) con un paquete `frm-contracts` publicado. Descartado: añade overhead de versionado y publicación de paquetes para un solo desarrollador.
- **Monorepo (elegido)**: Un solo repositorio, un solo `docker-compose.yml`, un solo CI/CD pipeline. Simplifica la consistencia de tipos entre servicios y el debugging cross-service.

## Consequences

- El repositorio actual `lamas-py` migra a ser `apps/lamas` + `apps/lamas-web` dentro de `frm-system`.
- El repositorio `creditgraph` (actualmente en `aisa/`) migra a `apps/creditgraph`.
- El contrato de tipos existente entre lamas y creditgraph se formaliza en `packages/frm-contracts`.
- La migración al monorepo es una tarea de reorganización de archivos — no afecta el código de aplicación.
- Un monorepo mixto (Python + TypeScript) requiere herramientas separadas por lenguaje: `uv` para Python, `pnpm workspaces` para TypeScript. No hay un solo package manager que cubra ambos.

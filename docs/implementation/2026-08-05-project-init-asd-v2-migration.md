# Implementación: Inicialización y Retrofit ASD Framework v2 (LAMaS)

## Objetivo

Actualizar e inicializar el repositorio de **LAMaS** (`technology/projects/aisa/lamas-py`) bajo el **Framework ASD v2** (software domain), garantizando la disponibilidad del pipeline Uncle Bob completo (7 agentes), workflows de desarrollo/sincronización, convenciones PII financieras y estructuración de tests Gherkin.

---

## Componentes Afectados

- `.agents/AGENTS.md` — Reglas y roles del agente adaptados al dominio software y LAMaS.
- `.agents/CONVENTIONS.md` — Convenciones del proyecto (PII `financial`, stack principal FastAPI/SQLModel/Next.js, DDD habilitado).
- `.agents/agents/` — Agentes del pipeline Uncle Bob (`orchestrator`, `specifier`, `coder`, `refactorer`, `architect`, `qa`, `pii-verifier`).
- `.agents/workflows/` — Workflows globales (`code-pipeline.md`, `repo-sync.md`, `post-session-doc.md`).
- `.gitignore` — Modificado de manera aditiva (inclusión de `vendor/`, `*.pem`, `*.key`, `Thumbs.db`, `desktop.ini`, etc.) sin sobreescribir ni eliminar entradas existentes.
- `ROADMAP.md` — Incorporación del modelo de dominio DDD (Domain Model, Bounded Contexts, Ubiquitous Language).
- `scripts/bump_version.py` — Otorgados permisos de ejecución (`chmod +x`).
- `tests/features/` — Estructuración del directorio para especificaciones de pruebas Gherkin (`.feature`).

---

## Detalles Técnicos

1. **Modo Update / Retrofit:**
   - Detectada la presencia previa de `.git/` y `.agents/`.
   - Se aplicó la actualización inyectando la estructura del pipeline sin alterar los archivos de código fuente existentes ni la historia de commits de Git.

2. **Clasificación PII & Seguridad:**
   - La propiedad `pii` en `CONVENTIONS.md` se configuró en `financial` para forzar la ejecución obligatoria del agente `pii-verifier` antes de realizar merges en el pipeline de desarrollo.

3. **Estructura DDD:**
   - Delimitados los Bounded Contexts: `customer-management`, `loan-applications`, `document-management`, `creditgraph-ai`, `settings-i18n`.

---

## Pruebas de Verificación

Se ejecutó un script de auditoría integral en entorno Ubuntu WSL comprobando 10 aspectos críticos:

```bash
# 1. Reglas y Convenciones
[ -f .agents/AGENTS.md ] && grep -E "name:|domain:|pii:" .agents/CONVENTIONS.md

# 2. Verificación de los 7 Agentes
ls -1 .agents/agents/

# 3. Workflows instalados
ls -1 .agents/workflows/

# 4. Sección DDD en Roadmap
grep -A 6 "## Domain Model" ROADMAP.md

# 5. Permisos del Script de Versión y Pruebas Gherkin
ls -l scripts/bump_version.py && ls -la tests/features/
```

**Resultado:** Todos los elementos auditados respondieron con estado `OK` (10/10).

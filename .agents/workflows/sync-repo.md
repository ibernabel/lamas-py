---
description: Sincroniza el repositorio Git para el proyecto LAMaS, actualizando la versión SemVer, clasificando los cambios en backend, frontend, docs o infraestructura y generando un commit convencional en inglés.
---

# Workflow: Sincronización de Repositorio (Sync Repo — LAMaS)

## Descripción
Este flujo de trabajo automatiza la auditoría, sincronización con remoto, actualización de versionado semántico (*SemVer*), preparación (*staging*), generación de mensajes de commit convencionales en inglés (*Conventional Commits*) y subida al repositorio remoto (*git push*) específicamente enfocado en el desarrollo del proyecto **LAMaS** (`technology/projects/aisa/lamas-py`).

---

## Disparador (When to run)
Ejecutar al **finalizar una característica**, solución de un fallo (*fix*), actualización de documentación (`/post-session-doc`) o al concluir una sesión de trabajo en el proyecto LAMaS.

---

## Pasos del Workflow

### Paso 1: Analizar Cambios en el Proyecto LAMaS
Analizar el estado de los archivos modificados, agregados o eliminados dentro del proyecto ejecutando el siguiente comando en el entorno WSL (Ubuntu):

```bash
# Inspect status of modified and untracked files in lamas-py
git status technology/projects/aisa/lamas-py/
```

Identificar el prefijo (*type*) y el alcance (*scope*) del commit analizando las rutas afectadas:
- `backend/app/api/` -> `feat(lamas-api)` o `fix(lamas-api)`
- `backend/app/models/` -> `feat(lamas-models)` o `refactor(lamas-models)`
- `backend/` -> `feat(lamas-backend)` o `fix(lamas-backend)`
- `frontend/src/` -> `feat(lamas-frontend)` o `fix(lamas-frontend)`
- `docs/`, `README.md`, `ROADMAP.md` -> `docs(lamas)`
- `docker-compose.yml`, `Makefile`, `.github/` -> `chore(lamas-infra)` o `ci(lamas)`
- `.agents/` -> `chore(lamas-agents)` o `docs(lamas-workflows)`

Construir un mensaje de commit convencional profesional en inglés siguiendo la estructura:
`<type>(<scope>): <short description>`

**Ejemplos:**
- `feat(lamas-api): add customer evaluation endpoint`
- `fix(lamas-frontend): fix document viewer hydration crash`
- `docs(lamas): update phase 4 completion report and status report`
- `chore(lamas-infra): update postgres container configuration`

---

### Paso 2: Verificación Pre-commit y Rebase de Remoto
Asegurar que el código esté libre de errores críticos y sincronizado con el repositorio remoto:

```bash
# 1. Run quick backend health test
cd technology/projects/aisa/lamas-py/backend && pytest tests/test_health.py -q

# 2. Fetch latest changes from remote origin
git fetch origin

# 3. Pull remote changes using rebase for clean history
git pull --rebase origin main
```

---

### Paso 3: Incrementar Versión del Proyecto (SemVer / Bump Version)
Si la sesión incluye cambios funcionales, fixes o características nuevas, actualizar la versión ejecutando el script oficial de versionado en Python:

```bash
# Bump patch version (e.g. 0.1.0 -> 0.1.1) for bug fixes or minor updates
python technology/projects/aisa/lamas-py/scripts/bump_version.py patch

# Or bump minor version (e.g. 0.1.0 -> 0.2.0) for new features
# python technology/projects/aisa/lamas-py/scripts/bump_version.py minor

# Or bump major version (e.g. 0.1.0 -> 1.0.0) for breaking changes
# python technology/projects/aisa/lamas-py/scripts/bump_version.py major
```

El script actualizará de forma coordinada `backend/pyproject.toml`, `frontend/package.json` y `VERSION`, aplicando `git add` sobre los archivos modificados.

---

### Paso 4: Staging y Commit Convencional

Ejecutar las operaciones de preparación y commit en el entorno WSL:

```bash
# 1. Add lamas-py changes to git staging area
git add technology/projects/aisa/lamas-py/

# 2. Commit with conventional commit message
git commit -m "{{COMMIT_MESSAGE}}"
```

*(Reemplazar `{{COMMIT_MESSAGE}}` con el mensaje generado en el Paso 1).*

---

### Paso 5: Push a Remoto (Commits y Tags)

Enviar los commits y las etiquetas (*tags*) de versión al repositorio remoto:

```bash
# 1. Push commits to remote main branch
git push origin main

# 2. Push version tags to remote origin (if version tag was created)
git push origin --tags
```

---

### Paso 6: Verificación Final

1. Verificar que el árbol de trabajo esté limpio:
   ```bash
   git status technology/projects/aisa/lamas-py/
   ```
2. Presentar un resumen al usuario que incluya:
   - Nueva versión del proyecto (`VERSION`, `pyproject.toml`, `package.json`).
   - Archivos o componentes sincronizados.
   - Mensaje de commit convencional utilizado.
   - Confirmación de push exitoso en el repositorio remoto.

---

## Resumen de Comandos Rápidos (Cheat Sheet)

```bash
# Quick sync workflow sequence for LAMaS
git status technology/projects/aisa/lamas-py/
python technology/projects/aisa/lamas-py/scripts/bump_version.py patch
git add technology/projects/aisa/lamas-py/
git commit -m "feat(lamas): brief description of changes"
git push origin main --tags
```

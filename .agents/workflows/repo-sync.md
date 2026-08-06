---
description: Sincronizar cambios locales de forma segura con GitHub (SemVer, tags, commit convencional, push con tags).
user-invocable: true
---

# Workflow: Sincronización con GitHub (Repo Sync)

## Descripción
Este workflow define el procedimiento estándar para sincronizar de forma segura los cambios locales del proyecto con el repositorio remoto en GitHub, garantizando un historial limpio, versionado semántico, **creación de etiquetas (tags)** y alineación con los estándares del proyecto.

---

## Disparador (When to run)
Ejecutar este workflow cuando:
- Se haya completado una tarea o funcionalidad.
- Se hayan aplicado correcciones de errores (fixes) o refactorizaciones.
- Se haya completado la documentación de fin de sesión (`post-session-doc.md`).
- Se requiera publicar o respaldar el trabajo actual en GitHub.

---

## Roles Asociados (ASD Framework)
- **Developer / QA:** Verificar que el código pase las pruebas antes de sincronizar.
- **Security:** Auditar que no se incluyan archivos `.env`, credenciales ni secretos en el staging.

---

## Pasos del Workflow

### Paso 1: Verificación de Pre-Sincronización
Comprobar el estado local de Git y confirmar la rama activa:

```bash
# 1. Check current branch and modified files
git status

# 2. Confirm current active branch name
git branch --show-current
```

> [!WARNING]
> Verificar siempre que archivos confidenciales (`.env`, secretos, PII de clientes) **NO** estén marcados para commit.

---

### Paso 2: Sincronización con Remoto (Fetch & Rebase)
Traer las últimas actualizaciones del repositorio en GitHub para evitar conflictos de merge:

```bash
# Fetch latest changes from remote origin
git fetch origin

# Pull remote changes using rebase for linear history
git pull --rebase origin $(git branch --show-current)
```

Si existen conflictos durante el rebase, resolverlos localmente y continuar con:
```bash
# Continue rebase after resolving conflicts
git rebase --continue
```

---

### Paso 3: Incrementar Versión del Proyecto y Crear Git Tag (SemVer)
Si el proyecto incluye control de versiones (`scripts/bump_version.py` o `VERSION` file):

```bash
# Bump patch version (e.g. 1.0.1 -> 1.0.2) and auto-create tag vX.Y.Z
python3 scripts/bump_version.py patch

# Or bump minor version (e.g. 1.0.2 -> 1.1.0) for new features
# python3 scripts/bump_version.py minor

# Or bump major version (e.g. 1.1.0 -> 2.0.0) for breaking changes
# python3 scripts/bump_version.py major
```

Si el proyecto no utiliza `bump_version.py` pero requiere tag manual:
```bash
# Create manual annotated git tag
git tag -a v1.0.0 -m "Release v1.0.0"
```

---

### Paso 4: Staging y Commit Convencional

1. Preparar archivos para commit:
```bash
# Stage modified files and documentation
git add .
```

2. Generar el commit siguiendo el estándar de **Conventional Commits**:
   - `feat: [descripción]` para nuevas características.
   - `fix: [descripción]` para correcciones de errores.
   - `docs: [descripción]` para cambios en documentación.
   - `refactor: [descripción]` para refactorización sin cambios de comportamiento.
   - `chore: [descripción]` para tareas de mantenimiento o configuración.

Ejemplo:
```bash
# Commit changes using Conventional Commit syntax
git commit -m "feat: implement project initialization workflow"
```

---

### Paso 5: Push a GitHub (Commits + Tags)

Enviar los commits y las etiquetas (tags) de versión al repositorio remoto:

```bash
# Push current branch commits to origin
git push origin $(git branch --show-current)

# Push all git tags to GitHub
git push origin --tags
```

---

### Paso 6: Verificación Post-Push

Confirmar que el espacio de trabajo quedó totalmente limpio y en sincronía con el remoto:

```bash
# Confirm clean working tree and branch status
git status
```

---

## Resumen de Comandos Rápidos (Cheat Sheet)

```bash
# Quick sync sequence
git fetch origin && git pull --rebase origin $(git branch --show-current)
python3 scripts/bump_version.py patch
git add .
git commit -m "feat: update functionality"
git push origin $(git branch --show-current) --tags
```

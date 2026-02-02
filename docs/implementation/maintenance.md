# Environment Maintenance

This document tracks fixes and maintenance tasks performed on the development environment and assistant tools.

## 2026-02-02: Repair Skills Symbolic Links

### Problem

The symbolic links in `.agent/skills/` were using relative paths that resolved incorrectly within the project structure, preventing the assistant from accessing global skills properly.

### Solution

Updated the symbolic links to use absolute paths pointing to the global `.agents/skills` directory in the user's home folder.

### Executed Actions

1. Identified broken links in `.agent/skills/`.
2. Verified absolute paths in `/home/ibernabel/.agents/skills/`.
3. Applied `ln -sf` for each skill to point to its absolute path.
4. Verified link integrity with `find .agent/skills -xtype l`.

### Affected Skills

- `api-design-principles`
- `architecture-patterns`
- `fastapi-templates`
- `github-actions-templates`
- `secrets-management`
- `vercel-react-best-practices`

### Commit

`fix: repair skills symbolic links to point to absolute global path`

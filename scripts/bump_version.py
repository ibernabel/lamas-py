#!/usr/bin/env python3
"""
Automated Semantic Versioning Script for LAMaS.
Bumps version in backend/pyproject.toml, frontend/package.json, frontend/lib/version.ts, and VERSION file.
"""

import sys
import re
import json
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_PYPROJECT = BASE_DIR / "backend" / "pyproject.toml"
FRONTEND_PACKAGE = BASE_DIR / "frontend" / "package.json"
FRONTEND_VERSION_TS = BASE_DIR / "frontend" / "lib" / "version.ts"
VERSION_FILE = BASE_DIR / "VERSION"


def parse_semver(version_str: str) -> tuple[int, int, int]:
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)$", version_str.strip())
    if not match:
        raise ValueError(f"Invalid SemVer string: '{version_str}'")
    return int(match.group(1)), int(match.group(2)), int(match.group(3))


def bump_version(major: int, minor: int, patch: int, bump_type: str) -> tuple[int, int, int]:
    if bump_type == "major":
        return major + 1, 0, 0
    elif bump_type == "minor":
        return major, minor + 1, 0
    else:  # patch
        return major, minor, patch + 1


def get_current_version() -> str:
    if VERSION_FILE.exists():
        return VERSION_FILE.read_text().strip()

    if BACKEND_PYPROJECT.exists():
        content = BACKEND_PYPROJECT.read_text()
        match = re.search(r'^version\s*=\s*"([^"]+)"', content, re.MULTILINE)
        if match:
            return match.group(1)

    if FRONTEND_PACKAGE.exists():
        data = json.loads(FRONTEND_PACKAGE.read_text())
        if "version" in data:
            return data["version"]

    return "1.0.0"


def update_pyproject(new_version: str, dry_run: bool) -> None:
    if not BACKEND_PYPROJECT.exists():
        return
    content = BACKEND_PYPROJECT.read_text()
    updated = re.sub(
        r'^(version\s*=\s*")[^"]+(")',
        rf'\g<1>{new_version}\g<2>',
        content,
        flags=re.MULTILINE,
    )
    if not dry_run:
        BACKEND_PYPROJECT.write_text(updated)


def update_package_json(new_version: str, dry_run: bool) -> None:
    if not FRONTEND_PACKAGE.exists():
        return
    content = FRONTEND_PACKAGE.read_text()
    updated = re.sub(
        r'("version"\s*:\s*")[^"]+(")',
        rf'\g<1>{new_version}\g<2>',
        content,
        count=1,
    )
    if not dry_run:
        FRONTEND_PACKAGE.write_text(updated)


def update_version_ts(new_version: str, dry_run: bool) -> None:
    content = (
        "/**\n"
        " * Application Version Configuration.\n"
        " * Automatically updated via scripts/bump_version.py\n"
        " */\n"
        f'export const APP_VERSION = "{new_version}";\n'
        'export const APP_VERSION_SHORT = APP_VERSION.split(".").slice(0, 2).join(".");\n'
    )
    if not dry_run:
        FRONTEND_VERSION_TS.parent.mkdir(parents=True, exist_ok=True)
        FRONTEND_VERSION_TS.write_text(content)


def update_version_file(new_version: str, dry_run: bool) -> None:
    if not dry_run:
        VERSION_FILE.write_text(f"{new_version}\n")


def stage_git_files(*files: Path) -> None:
    for f in files:
        if f.exists():
            subprocess.run(["git", "add", str(f)], check=False)


def main():
    args = sys.argv[1:]
    is_dry_run = "--dry-run" in args or "--test" in args
    clean_args = [a for a in args if not a.startswith("--")]

    bump_type = "patch"
    if clean_args and clean_args[0].lower() in ["major", "minor", "patch"]:
        bump_type = clean_args[0].lower()

    current_ver = get_current_version()
    try:
        major, minor, patch = parse_semver(current_ver)
    except ValueError as e:
        print(f"[Error] {e}")
        sys.exit(1)

    new_major, new_minor, new_patch = bump_version(major, minor, patch, bump_type)
    new_ver = f"{new_major}.{new_minor}.{new_patch}"

    print(f"[Version Bump] {current_ver} -> {new_ver} ({bump_type})")

    if is_dry_run:
        print("[Dry Run] No files modified.")
        sys.exit(0)

    update_pyproject(new_ver, dry_run=False)
    update_package_json(new_ver, dry_run=False)
    update_version_ts(new_ver, dry_run=False)
    update_version_file(new_ver, dry_run=False)

    stage_git_files(
        BACKEND_PYPROJECT,
        FRONTEND_PACKAGE,
        FRONTEND_VERSION_TS,
        VERSION_FILE,
    )
    print(f"[Git] Staged updated version files with new version {new_ver}")


if __name__ == "__main__":
    main()

# Documento de Requerimientos: Vista de Configuración (/settings) e Internacionalización Multi-Idioma (i18n)

**Tipo**: Documento de Requerimientos Técnicos y Arquitectura  
**Fecha**: 2026-07-30  
**Autor**: Antigravity (AI Architect) / Idequel Bernabel  
**Estado**: 📋 Aprobado para implementación  

---

## 1. Objetivo

Establecer la especificación funcional y técnica para:
1. **Vista de Configuración (`/settings`)**: Un panel dedicado de preferencias del usuario y del sistema (Idioma, Tema visual, Notificaciones y Perfil).
2. **Acceso desde Footer de Navegación**: Integración de un botón directo a Configuración en la parte inferior (Footer) del `Sidebar` lateral.
3. **Arquitectura Multi-Idioma (i18n)**: Implementación de un sistema reactivo de traducción con soporte inicial para **Español (`es`)** (predeterminado) e **Inglés (`en`)**, con selección de idioma tanto en el `Header` como en la vista `/settings`.

---

## 2. Descripción de Requerimientos

### REQ-SET-001: Botón de Acceso en Footer del Sidebar
- **Ubicación**: En la sección inferior (`Footer`) del componente `Sidebar.tsx`.
- **Comportamiento**:
  - En modo expandido: Muestra un ícono `Settings` de `lucide-react` acompañado de la etiqueta "Configuración" / "Settings".
  - En modo colapsado: Muestra el ícono `Settings` centrado con tooltip descriptivo ("Configuración").
  - Al hacer clic, navega a la ruta `/settings`.
  - Resalta dinámicamente como ítem activo cuando la ruta actual es `/settings`.

### REQ-SET-002: Vista `/settings` (Configuración del Sistema)
- **Ruta**: `frontend/app/(dashboard)/settings/page.tsx`
- **Secciones del Panel**:
  1. **Preferencias de Idioma (i18n)**:
     - Selección entre 🇪🇸 **Español** y 🇺🇸 **English**.
     - Actualización instantánea en toda la UI sin necesidad de recargar la página.
     - Persistencia en `localStorage` (`'lamas_language_pref'`).
  2. **Apariencia y Tema (Theme)**:
     - Integración con `next-themes` para alternar entre **Claro**, **Oscuro** y **Sistema**.
  3. **Preferencias del Sistema (Futuras iteraciones)**:
     - Notificaciones por correo / alertas de evaluación CreditGraph AI.
     - Opciones de densidad de tablas y preferencias de exportación CSV.

### REQ-SET-003: Arquitectura Multi-Idioma i18n
- **Ubicación de Código**: `frontend/lib/i18n/`
- **Componentes**:
  - `config.ts`: Configuración de locales soportados (`es`, `en`).
  - `locales/es.ts`: Diccionario completo en Español (Dominicano / Financiero).
  - `locales/en.ts`: Diccionario completo en Inglés.
  - `context.tsx`: `LanguageProvider` React Context para estado global.
  - `use-translation.ts`: Hook `useTranslation()` con función `t('key.path')`.
  - `LanguageSwitcher.tsx`: Dropdown selector en el `Header`.

---

## 3. Plan de Archivos a Crear y Modificar

| Archivo | Tipo | Descripción |
|---|---|---|
| `docs/planning/req-settings-view-and-i18n.md` | [NEW] | Este documento de especificación SSOT |
| `frontend/lib/i18n/config.ts` | [NEW] | Definición de idiomas y claves de persistencia |
| `frontend/lib/i18n/locales/es.ts` | [NEW] | Diccionario i18n Español |
| `frontend/lib/i18n/locales/en.ts` | [NEW] | Diccionario i18n Inglés |
| `frontend/lib/i18n/context.tsx` | [NEW] | React Context & LanguageProvider |
| `frontend/lib/i18n/use-translation.ts` | [NEW] | Custom Hook useTranslation |
| `frontend/components/layout/LanguageSwitcher.tsx` | [NEW] | Componente selector de idioma |
| `frontend/app/(dashboard)/settings/page.tsx` | [NEW] | Vista `/settings` de Configuración |
| `frontend/components/layout/sidebar.tsx` | [MODIFY] | Agregar botón Settings en Footer y traducir |
| `frontend/components/layout/header.tsx` | [MODIFY] | Integrar LanguageSwitcher |
| `frontend/app/layout.tsx` | [MODIFY] | Envolver con LanguageProvider |

---

## 4. Criterios de Aceptación

- [ ] El Footer del Sidebar incluye el botón "Configuración" / "Settings" que redirige a `/settings`.
- [ ] La página `/settings` permite cambiar el idioma entre Español e Inglés y refleja los cambios inmediatamente.
- [ ] La preferencia de idioma seleccionada se persiste en `localStorage` y se restaura al recargar.
- [ ] El `Header` incluye un selector rápido de idioma (`LanguageSwitcher`).
- [ ] Toda la navegación, badges, tablas, modales y notificaciones responden reactivamente al idioma activo.

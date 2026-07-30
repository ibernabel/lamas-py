# Documento de Requerimientos: Personalización de Apariencia de Tablas en Configuración (/settings)

**Tipo**: Documento de Requerimientos Técnicos y Arquitectura  
**Fecha**: 2026-07-30  
**Autor**: Antigravity (AI Architect) / Idequel Bernabel  
**Estado**: 📋 Aprobado para implementación  

---

## 1. Objetivo

Establecer la especificación funcional, de experiencia de usuario y de arquitectura para permitir la **personalización dinámica de la apariencia de las tablas** en la plataforma **LAMaS**. 

Las opciones de personalización se ubicarán en la sección **"Apariencia" (Appearance)** dentro de la vista `/settings`, permitiendo a los usuarios configurar:
1. **Fondo de Encabezado**: Activar o desactivar el color/degradado de fondo de los encabezados de tabla.
2. **Sentido del Degradado**: Alternar la orientación del degradado entre **Horizontal** (de derecha a izquierda, estilo SoliPres clásico) y **Vertical** (de arriba a abajo).
3. **Transformación del Texto**: Alternar el formato del texto de los encabezados entre **MAYÚSCULAS** (SoliPres) y **Texto Normal / Mayúscula Inicial**.
4. **Persistencia Dual**: Guardar las preferencias tanto localmente en el navegador (`localStorage`) como en la base de datos (Backend FastAPI API / Perfil de usuario) para sincronización entre dispositivos.

---

## 2. Descripción de Requerimientos

### REQ-TAB-001: Controles de Apariencia de Tablas en `/settings`
- **Ubicación**: En la página `frontend/app/(dashboard)/settings/page.tsx`, dentro de la tarjeta **"Apariencia" (Appearance)**.
- **Nuevos Controles UI**:
  - **Fondo de Encabezado (Switch / Toggle)**:
    - Etiqueta: *"Color de fondo en encabezados de tabla"* / *"Table header background color"*.
    - Opciones: `Habilitado (Sí)` | `Deshabilitado (Transparente/Plano)`.
  - **Sentido del Degradado (Radio Group / Select)**:
    - Etiqueta: *"Orientación del degradado"* / *"Gradient direction"*.
    - Opciones: 
      - `Horizontal (Derecha a Izquierda)` -> `bg-gradient-to-l` (Estilo SoliPres).
      - `Vertical (Arriba a Abajo)` -> `bg-gradient-to-b`.
    - *Deshabilitado reactivamente si la opción de fondo está apagada*.
  - **Transformación de Texto (Radio Group / Select)**:
    - Etiqueta: *"Formato de texto en encabezados"* / *"Header text capitalization"*.
    - Opciones: 
      - `MAYÚSCULAS` -> `uppercase`.
      - `Texto Normal (Mayúscula Inicial)` -> `normal-case` / `capitalize`.

---

### REQ-TAB-002: Consumo Reactivo en Componentes de Tabla (`frontend/components/ui/table.tsx`)
- **Arquitectura de Estado**:
  - Creado un contexto React `TableAppearanceProvider` y un custom hook `useTableAppearance()`.
- **Componentes Impactados**:
  - `TableHeader` y `TableHead` en `frontend/components/ui/table.tsx`.
  - Todas las tablas del sistema (`/customers`, `/customers/{id}`, `/loans`, `DocumentList`) reflejarán de manera instantánea y reactiva los cambios de configuración sin requerir recarga de la página.
- **Lógica de Renderizado Dinámico**:
  - Si `showBackground === false`: `bg-transparent text-foreground border-b border-border`.
  - Si `showBackground === true`: Aplica gradiente según `gradientDirection` (`horizontal` ➔ `bg-gradient-to-l`, `vertical` ➔ `bg-gradient-to-b`) con texto blanco (`text-white`).
  - Formato de texto: Aplica clase `uppercase` o `normal-case` según `textTransform`.

---

### REQ-TAB-003: Capa de Persistencia Dual (`localStorage` + FastAPI DB)

#### A. Persistencia Cliente (`localStorage`)
- **Clave**: `'lamas_table_appearance_prefs'`
- **Estructura JSON**:
```json
{
  "showBackground": true,
  "gradientDirection": "horizontal",
  "textTransform": "uppercase"
}
```
- Se carga de manera síncrona al hidratar el estado de React para evitar parpadeos visuales (Layout Shift).

#### B. Persistencia Backend / Base de Datos (FastAPI + SQLModel)
- **Modelo SQLModel (`UserPreference`)**:
  - Campo JSON/Text `table_appearance` en la tabla `users` o tabla de preferencias `user_preferences`.
- **API Endpoint**:
  - `GET /api/v1/users/me/preferences`: Retorna las preferencias guardadas del usuario autenticado.
  - `PATCH /api/v1/users/me/preferences`: Actualiza parcialmente las preferencias de apariencia.
- **Sincronización**: Al iniciar sesión o guardar en `/settings`, se envía un request asíncrono para respaldar la configuración en la base de datos PostgreSQL.

---

## 3. Plan de Archivos a Crear y Modificar

| Archivo | Tipo | Descripción |
|---|---|---|
| `docs/planning/req-table-appearance-customization.md` | [NEW] | Este documento de especificación SSOT |
| `frontend/lib/theme/table-appearance-context.tsx` | [NEW] | React Context & Provider para configuración de tablas |
| `frontend/lib/theme/use-table-appearance.ts` | [NEW] | Custom Hook para consumir preferencias de tablas |
| `frontend/components/ui/table.tsx` | [MODIFY] | Actualizar `TableHeader` y `TableHead` para consumir `useTableAppearance()` |
| `frontend/app/(dashboard)/settings/page.tsx` | [MODIFY] | Agregar los controles en la sección de Apariencia |
| `backend/app/models/user_preference.py` | [NEW] | Modelo SQLModel para preferencias en BD |
| `backend/app/api/v1/endpoints/preferences.py` | [NEW] | Endpoints FastAPI para GET/PATCH de preferencias |
| `docs/README.md` | [MODIFY] | Registrar el documento de requerimientos en el índice |

---

## 4. Criterios de Aceptación

- [ ] La página `/settings` muestra los nuevos controles bajo la sección **Apariencia**: Toggle de fondo, Selector de orientación de degradado (Horizontal/Vertical) y Formato de texto (MAYÚSCULAS/Normal).
- [ ] Al cambiar cualquier opción en `/settings`, los cambios se aplican de forma instantánea a todas las tablas del dashboard sin recargar la página.
- [ ] Las preferencias se persisten en `localStorage` y se restauran al reabrir la sesión.
- [ ] Las preferencias se respaldan en la BD mediante el endpoint de FastAPI.
- [ ] Pruebas unitarias en Vitest confirman que `table.tsx` renderiza las clases correspondientes (`bg-gradient-to-l`, `bg-gradient-to-b`, `uppercase`, `normal-case`, `bg-transparent`) en función del contexto de apariencia.

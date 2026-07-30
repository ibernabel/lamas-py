# ADR 005: Preservación de Identidad Visual y Familiaridad de UI (SoliPres ➔ LAMaS)

**Estado**: ✅ Aprobado  
**Fecha**: 2026-07-30  
**Autor**: Idequel Bernabel (Full Stack Developer) / Antigravity (AI Architect)

---

## Contexto

El proyecto **LAMaS (Loan Applications Management System)** representa la evolución tecnológica del sistema legacy **SoliPres** (desarrollado previamente en Laravel + Blade + DataTables + Bootstrap). 

Durante el proceso de modernización hacia el nuevo stack (FastAPI + SQLModel + Next.js + TailwindCSS + shadcn/ui), la primera versión de la interfaz utilizó componentes de tabla planos por defecto (encabezados grises claros sin textura ni divisores y botones aislados), lo que generaba un contraste drástico con la experiencia de usuario a la que están acostumbrados los analistas y oficiales de crédito actuales de SoliPres.

Dado que LAMaS sustituirá de forma gradual a SoliPres en la operación diaria de SoluFime, es un requisito clave de Producto y Experiencia de Usuario (UX) que los usuarios actuales encuentren un entorno **familiar y reconfortante**, reduciendo la curva de aprendizaje y la resistencia al cambio.

---

## Decisión

Adoptar una estrategia de **Fidelidad Visual y Continuidad UX** en los componentes clave de la aplicación (tablas de `/customers`, `/customers/{id}`, `/loans` y gestión de documentos), manteniendo los siguientes elementos distintivos de la interfaz SoliPres:

1. **Encabezados de Tabla con Degradado Horizontal (SoliPres Banner)**:
   - Aplicar el degradado corporativo azul horizontal de derecha a izquierda (`bg-gradient-to-l from-[#0284c7] via-[#0275b1] to-[#01579b] text-white`).
   - Títulos en texto blanco, negrita y mayúsculas (`font-bold text-xs uppercase text-white tracking-wider`).
   - Divisores verticales sutiles en blanco (`border-r border-white/25`) entre celdas del encabezado, imitando la textura de solapas clásicas.

2. **Botonera de Acciones en Píldora Redondeada (`Action Toolbar`)**:
   - Agrupar los botones de acción en un contenedor con borde y forma de píldora redondeada (`rounded-full border border-slate-200 bg-card px-3 py-1 shadow-2xs`).
   - Ícono de visualización `Eye` en azul corporativo (`#0284c7`) con etiqueta "Ver".
   - Separador vertical sutil (`|`).
   - Ícono de edición preciso `FilePenLine` (lápiz sobre hoja de papel) con etiqueta "Editar" en tamaño compacto legible (`text-xs font-semibold`).

3. **Homogenización de Badges de Estado (`Status Badges`)**:
   - Reutilizar el sistema de badges de estado con bordes redondeados (`rounded-full px-2.5 py-0.5 text-xs font-semibold`) y paletas HSL (`--success-bg`/`--success-fg` para Activo/Aprobada y `--danger-bg`/`--danger-fg` para Inactivo/Rechazada), garantizando paridad visual entre `/loans` y `/customers`.

---

## Alternativas Consideradas

| Alternativa | Razón de rechazo |
|---|---|
| Rediseño 100% plano (Modern Flat Minimalist UI) | Ocasionaba desconexión visual y resistencia al cambio en el equipo operativo acostumbrado a la densidad de SoliPres. |
| Replicar código HTML/CSS legacy directo de Laravel | Incompatible con los tokens de TailwindCSS v4, shadcn/ui y soporte de Dark Mode en Next.js. |
| **Solución Adoptada (SoliPres Corporate Modernized)** | Combina lo mejor de dos mundos: mantenibilidad y Dark Mode con Next.js + Tailwind v4, preservando la familiaridad visual de SoliPres. |

---

## Consecuencias

### Positivas
- **Familiaridad de UI**: Transición fluida y sin fricción para los usuarios actuales de SoliPres al migrar a LAMaS.
- **Identidad Corporativa**: Consistencia en el color institucional de SoluFime (azul `#0284c7`).
- **Estandarización**: Unificación del diseño de tablas y botones de acción en todas las rutas del dashboard.

### Trade-offs
- **Custom Styling en Base UI**: Modificación ligera del componente genérico `Table` (`TableHeader`, `TableHead`) para inyectar los gradientes por defecto en todas las tablas del sistema.

### Consideraciones futuras
- Extender el estilo de tarjetas KPI de SoliPres (`solipres-kpi-card`) a nuevos módulos que se incorporen en fases posteriores.

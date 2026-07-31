# ADR 006: Remoción de la Entrada Inhabilitada "Credit Analysis" del Sidebar Navegacional

**Estado**: ✅ Aprobado  
**Fecha**: 2026-07-31  
**Autor**: Idequel Bernabel (Senior Full Stack Developer) / Antigravity (AI Architect)

---

## Contexto

Durante las fases iniciales de prototipado de la interfaz de usuario (Fases 1 a 3), se incluyó un elemento inhabilitado en la barra lateral ([sidebar.tsx](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/components/layout/sidebar.tsx)) denominado `"Credit Analysis"` con la etiqueta `"Phase 8"` que apuntaba a la ruta provisional `/analysis`.

Al completarse la **Fase 8 (CreditGraph AI Integration)**, la arquitectura de interfaz de usuario evolucionó para integrar las evaluaciones de riesgo crediticio de forma **contextual** dentro de las páginas de entidad existentes:

1. **Por Solicitud de Préstamo:** `/loans/[id]/analysis` ([LoanAnalysisPage](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/app/(dashboard)/loans/%5Bid%5D/analysis/page.tsx)), que ofrece el panel interactivo completo (Score IRS, gráfico de radar, comparativa de ingresos detectados vs reportados, narrativa explicativa de la IA y re-evaluación).
2. **Por Cliente:** `/customers/[id]` en la pestaña **"Analysis"** ([CustomerCreditGraphAnalysis](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/components/customers/CustomerCreditGraphAnalysis.tsx)).

Dado que el flujo de trabajo operativo de los analistas de crédito se realiza directamente sobre el expediente de un cliente o solicitud de préstamo, la ruta global `/analysis` no fue necesaria y el enlace en la barra lateral permaneció inhabilitado (`disabled: true`), lo que generaba ambigüedad respecto a la disponibilidad y estado de la Fase 8.

---

## Decisión

1. **Remover completamente** la entrada `nav.creditAnalysis` del arreglo `navItems` en [sidebar.tsx](file:///z:/home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py/frontend/components/layout/sidebar.tsx) y eliminar la importación innecesaria de `BarChart3`.
2. **Preservar la accesibilidad contextual de CreditGraph AI** en las vistas detalladas de préstamos (`/loans/[id]/analysis`) y clientes (`/customers/[id]?tab=analysis`).
3. **Mantener las traducciones e identificadores de i18n** (`nav.creditAnalysis`, `dashboard.navCreditGraphDesc`) para su uso en tarjetas informativas del Dashboard Principal.

---

## Alternativas Consideradas

| Alternativa | Razón de Rechazo |
|---|---|
| Mantener la entrada bloqueada en el sidebar con el badge `"Phase 8"` | Generaba confusión visual, sugiriendo erróneamente que la Fase 8 no había sido completada. |
| Crear una vista global `/analysis` con un listado general de análisis | Redundante para el flujo operativo actual, donde el análisis se requiere dentro del contexto de una solicitud o cliente específico. |
| **Solución Adoptada (Navegación Contextual Purificada)** | Elimina elementos bloqueados en la UI, manteniendo el 100% de la funcionalidad de CreditGraph AI accesible donde corresponde. |

---

## Consecuencias

### Positivas
- **Claridad de Interfaz (UX)**: Menú lateral más limpio y sin elementos inhabilitados o confusos.
- **Transparencia en el Roadmap**: Evita falsas impresiones de características pendientes de la Fase 8.
- **Coherencia Arquitectónica**: Las herramientas de IA permanecen acopladas contextualmente a los expedientes de préstamos y clientes.

### Trade-offs
- Ninguno.

# ADR 004: Restauración de Enum Semánticos en Migración Laravel → FastAPI

**Estado**: ✅ Aprobado  
**Fecha**: 2026-07-30  
**Autor**: Idequel Bernabel / Antigravity (AI Architect)

---

## Contexto

Durante la migración del sistema legacy (Laravel + MySQL) a la nueva implementación (FastAPI + SQLModel + Next.js), varios campos que en la base de datos relacional eran de tipo `ENUM` fueron implementados como `str` libre (sin restricción de valores) en los schemas Pydantic y como `<Input type="text">` en el formulario React. Este anti-patrón surgió por priorizar la velocidad de migración sobre la fidelidad del modelo de datos.

Los campos afectados eran críticos para el análisis crediticio del motor **CreditGraph AI**: `education_level`, `housing_type`, `mode_of_transport`, `payment_frequency`, entre otros, son variables de entrada del algoritmo IRS. Valores libres de texto generan ruido en el pipeline de IA.

---

## Decisión

Restaurar la semántica de enum en las **tres capas del stack** de forma sincronizada:

1. **Backend (Pydantic)**: Usar `Literal[...]` en lugar de `str | None` para todos los campos con dominio finito de valores.
2. **Frontend Types (TypeScript)**: Usar union types `"valor1" | "valor2"` en lugar de `string`.
3. **Frontend Validation (Zod)**: Usar `z.enum([...])` en lugar de `z.string()`.
4. **Frontend UI (React)**: Usar `<Select>` de shadcn/ui en lugar de `<Input type="text">`.

**Valores de `gender` elegidos**: `male | female | other` (más explícitos y estándar que los códigos `M/F/O` del legacy).

---

## Alternativas Consideradas

| Alternativa | Razón de rechazo |
|---|---|
| Mantener `str` libre en backend, solo restringir en frontend | Violación del principio de validación en capa de dominio. El backend aceptaría valores inválidos directamente por API. |
| Crear una tabla separada `enum_values` en DB | Over-engineering. Los valores son estables y controlados por el producto, no por el usuario. Violaría KISS. |
| Usar `str` con validador `@field_validator` que valide contra lista | Viable pero más verboso que `Literal`. TypeScript no inferiría los tipos automáticamente. |

---

## Consecuencias

### Positivas
- **Integridad de datos**: El backend rechaza HTTP 422 ante valores inválidos en campos enum.
- **DX mejorada**: TypeScript autocompletado en todos los campos enum del formulario.
- **CreditGraph AI**: Variables de entrada limpias y predecibles para el algoritmo IRS.
- **UX mejorada**: El usuario selecciona de una lista controlada, eliminando errores tipográficos.

### Trade-offs
- **Datos legacy en DB**: Los registros existentes con `gender = "M"/"F"/"O"` requieren una migración SQL puntual.
- **Rigidez**: Agregar un nuevo valor de enum requiere cambiar backend schema, tipos TS y Zod enum en 3 archivos. Mitigación: los valores son exportados como constantes `SSOT` desde `customer.schema.ts`.

### Consideraciones futuras
- Evaluar si `housing_type` en `CustomerFinancialInfo` debe sincronizarse con el mismo enum de `CustomerDetail.housing_type` (actualmente son campos separados con posible inconsistencia).
- El formulario público (`solicitar/page.tsx`) aún usa valores en MAYÚSCULAS (`SINGLE`, `OWNED`, etc.) — pendiente de corrección en la siguiente sesión (ver ADR pendiente).

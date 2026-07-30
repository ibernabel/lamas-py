# Reporte de Discrepancias: Formulario Público `solicitar/page.tsx`

**Fecha de detección**: 2026-07-30  
**Detectado por**: Auditoría LoanApplication (subagente LoanApplication Auditor)  
**Estado**: ✅ RESUELTO (2026-07-30) — Ver [implementación](../implementation/2026-07-30-public-form-enum-unification.md)  
**Prioridad**: Resuelta — Enums unificados en minúsculas (Opción B)

---

## Descripción del Problema

El formulario público de solicitud de préstamo (`frontend/app/(public)/solicitar/page.tsx`) usa valores **en MAYÚSCULAS** para varios campos enum, mientras que el backend FastAPI y el formulario administrativo `CustomerForm.tsx` usan **minúsculas** (alineados con el legacy Laravel DB).

Esta discrepancia provoca que los datos capturados en el wizard público lleguen al backend con valores **inválidos**, siendo rechazados por los `Literal` de Pydantic (HTTP 422) o, si el backend no valida estrictamente, almacenados con valores incorrectos que rompen la lógica de CreditGraph AI.

---

## Mapa de Discrepancias por Campo

### 1. `marital_status` (Estado Civil)

| Aspecto | Formulario Público (`solicitar`) | Backend FastAPI / Formulario Admin |
|---|---|---|
| Valor Soltero/a | `"SINGLE"` | `"single"` |
| Valor Casado/a | `"MARRIED"` | `"married"` |
| Valor Divorciado/a | `"DIVORCED"` | `"divorced"` |
| Valor Viudo/a | `"WIDOWED"` | `"widowed"` |
| Valor adicional | `"COMMON_LAW"` (Unión Libre) | `"other"` |
| **Incompatible** | `"COMMON_LAW"` no existe en backend | — |
| **Faltante** | No existe `"other"` | `"other"` existe en backend |

**Decisión requerida**: ¿Mapear `COMMON_LAW` → `"other"` o agregar `"common_law"` al backend?

---

### 2. `housing_type` (Tipo de Vivienda)

| Aspecto | Formulario Público (`solicitar`) | Backend FastAPI / Formulario Admin |
|---|---|---|
| Valor Casa propia | `"OWNED"` | `"house"` |
| Valor Alquilada | `"RENTED"` | `"apartment"` / `"other"` |
| Valor Hipotecada | `"MORTGAGED"` | `"other"` |
| Valor Familiar | `"FAMILY"` | ❌ No existe |
| **Semántica diferente** | `OWNED/RENTED/MORTGAGED` = posesión | `house/apartment/other` = tipo físico |

> [!CAUTION]
> Este es el campo con mayor discrepancia semántica. El formulario público combina **tipo de vivienda** (casa/apartamento) con **tipo de posesión** (propia/alquilada) en un solo select. El formulario admin los separa en `housing_type` (tipo físico) y `housing_possession_type` (posesión).

**Decisión requerida**: ¿Unificar en un solo campo o mantener separados? (Ver sección de opciones de solución)

---

### 3. `education_level` (Nivel Educativo)

| Aspecto | Formulario Público (`solicitar`) | Backend FastAPI / Formulario Admin |
|---|---|---|
| Primaria | `"PRIMARY"` | `"primary"` |
| Secundaria | `"SECONDARY"` | `"secondary"` |
| Bachillerato | — | `"high_school"` |
| Técnico Superior | `"TECHNICAL"` | ❌ No existe |
| Universitario | `"UNIVERSITY"` | `"bachelor"` |
| Postgrado/Maestría | `"POSTGRADUATE"` | `"postgraduate"` / `"master"` |
| **Faltante en público** | — | `"doctorate"`, `"other"`, `"high_school"` |
| **Faltante en backend** | `"TECHNICAL"` | — |

---

### 4. `occupation_type` (Nuevo campo — solo en formulario público)

El formulario público introdujo `occupation_type` con valores `EMPLOYED`, `INDEPENDENT`, `BUSINESS_OWNER`, `OTHER` como reemplazo del campo booleano `is_self_employed` del legacy.

**Estado**: El backend **no tiene** este campo en los schemas actuales. Si se está enviando al backend, se ignora silenciosamente.

---

### 5. `payment_bank` (solo en formulario público)

El formulario público tiene un `<select>` de bancos (`BANRESERVAS`, `POPULAR`, `BHD`, etc.) pero el backend `CustomerJobInfoCreate.payment_bank` es `str | None` libre.

**Estado**: Funciona correctamente (el backend acepta cualquier string). El único riesgo es inconsistencia en los valores almacenados si el admin usa texto libre y el público usa las claves de banco.

---

## Opciones de Solución

### Opción A — Corrección Simple (Recomendada para MVP)
Convertir los valores del formulario público de MAYÚSCULAS a minúsculas, alineándolos con el backend:

```diff
// solicitar/page.tsx — marital_status
- <option value="SINGLE">Soltero(a)</option>
+ <option value="single">Soltero(a)</option>
- <option value="COMMON_LAW">Unión Libre</option>
+ <option value="other">Unión Libre</option>  {/* mapear a 'other' */}

// solicitar/page.tsx — education_level
- <option value="UNIVERSITY">Universitario</option>
+ <option value="bachelor">Universitario/Licenciatura</option>
- <option value="TECHNICAL">Técnico Superior</option>
+ <option value="other">Técnico Superior</option>  {/* mapear a 'other' */}
```

Para `housing_type`: separar en dos campos en el wizard público (housing_type + housing_possession_type), o mapear los valores actuales a `housing_possession_type` exclusivamente.

**Esfuerzo estimado**: 2–3 horas  
**Riesgo**: Bajo — solo cambia valores de opciones en el wizard

### Opción B — Unificación de Esquemas (Más robusta)
Agregar al backend los valores faltantes (`common_law`, `technical`, `family`) y sincronizar todos los enums en un archivo compartido de constantes.

**Esfuerzo estimado**: 1 día  
**Riesgo**: Medio — requiere migration de DB y actualización de CreditGraph AI

---

## Archivos a Modificar (Opción A)

| Archivo | Cambios |
|---|---|
| `frontend/app/(public)/solicitar/page.tsx` | Valores de opciones en `marital_status`, `housing_type`, `education_level` |
| `frontend/lib/validations/loan-application.schema.ts` | Zod enums del wizard público alineados con backend |
| `backend/app/schemas/customer.py` (opcional) | Agregar `common_law` y `technical` si se elige Opción B |

---

## Impacto en CreditGraph AI

Los campos `housing_type` y `education_level` son variables de entrada del algoritmo IRS. Valores como `"OWNED"` o `"UNIVERSITY"` que llegan al backend con HTTP 422 implican que **todas las solicitudes del formulario público fallan en creación** si el backend valida estrictamente.

---

## Próximos Pasos

1. **Decisión**: Confirmar Opción A o B con el stakeholder. (✅ **Completado: Opción B elegida**)
2. **Implementación**: Aplicar correcciones en `solicitar/page.tsx` y su schema Zod. (✅ **Completado**)
3. **Testing**: Verificar que el wizard completa el flujo end-to-end y los datos llegan al backend con valores correctos. (✅ **Completado — `loan-application.schema.test.ts` 18/18 pasando. Nota: 18 fallos reportados en `pnpm test` corresponden a componentes UI pre-existentes no relacionados**).
4. **Verificación CreditGraph**: Confirmar que el pipeline de análisis recibe variables limpias. (✅ **Completado**)

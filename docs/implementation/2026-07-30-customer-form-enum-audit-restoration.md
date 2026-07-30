# Implementación: Auditoría y Restauración de Campos Enum (CustomerForm)

**Fecha**: 2026-07-30  
**Sesión**: Auditoría Legacy Laravel → FastAPI + Next.js  
**Categoría**: Corrección/Mejora — Formulario de Clientes

---

## Objetivo

Realizar una auditoría exhaustiva comparando el sistema **legacy Laravel** con la nueva implementación **FastAPI + Next.js**, identificando campos que fueron degradados de `<select>` con valores enum a `<Input>` de texto libre durante la migración. Restaurar la semántica de datos correcta en las tres capas del stack (backend Pydantic, tipos TypeScript, formulario React).

---

## Contexto

Durante la migración de Laravel a FastAPI + Next.js, varios campos que en la BD eran `ENUM` fueron implementados como `str` libre en los schemas Pydantic y como `<Input type="text">` en el frontend. Esto provocaba:

- Inconsistencia de datos (valores libres vs. valores controlados)
- Ausencia del campo `payment_frequency` en la UI laboral
- Campo `vehicle_type` inexistente en el formulario de vehículo
- Pestaña de vehículo sin lógica condicional (mostraba formulario vacío aunque el cliente no tuviera vehículo)
- Género con valores `M/F/O` en lugar de los más explícitos `male/female/other`
- Selects sin opción placeholder "— Seleccione —"

---

## Componentes Afectados

### Backend
| Archivo | Cambio |
|---|---|
| `backend/app/schemas/customer.py` | 9 campos convertidos a `Literal` en `CustomerDetailCreate`, `CustomerDetailUpdate`, `CustomerJobInfoCreate`, `CustomerVehicleCreate` |
| `backend/scripts/seed_customers.py` | 5 valores `gender: "M"/"F"` → `"male"/"female"` |
| `backend/tests/factories/customer_factory.py` | `FuzzyChoice(["M","F","O"])` → `FuzzyChoice(["male","female","other"])` |
| `backend/tests/test_customer_service.py` | 2 valores gender actualizados |
| `backend/tests/test_customers_api.py` | 4 valores gender actualizados |
| `backend/tests/test_polymorphic_fixes.py` | 2 valores gender actualizados |

### Frontend
| Archivo | Cambio |
|---|---|
| `frontend/lib/validations/customer.schema.ts` | 9 campos `z.string()` → `z.enum([...])` con valores restaurados del legacy DB |
| `frontend/lib/api/types.ts` | Union types actualizados en `CustomerDetail`, `CustomerDetailCreate`, `CustomerJobInfoRead`, `CustomerVehicle` |
| `frontend/components/customers/CustomerForm.tsx` | 7 `<Input>` → `<Select>`, 2 nuevos campos Select, lógica condicional vehicle tab |

---

## Detalles Técnicos

### Campos enum restaurados (backend `Literal` y frontend `z.enum`)

| Campo | Valores |
|---|---|
| `gender` | `male`, `female`, `other` |
| `marital_status` | `single`, `married`, `divorced`, `widowed`, `other` |
| `education_level` | `primary`, `secondary`, `high_school`, `bachelor`, `postgraduate`, `master`, `doctorate`, `other` |
| `housing_type` | `house`, `apartment`, `other` |
| `housing_possession_type` | `owned`, `rented`, `mortgaged`, `other` |
| `mode_of_transport` | `public_transportation`, `own_car`, `own_motorcycle`, `bicycle`, `other` |
| `payment_type` | `cash`, `bank_transfer`, `check`, `other` |
| `payment_frequency` | `daily`, `weekly`, `bi-weekly`, `fortnightly`, `monthly` |
| `vehicle_type` | `sedan`, `suv`, `truck`, `van`, `coupe`, `bike`, `motorcycle`, `other` |

### Vehicle Tab — Opción B (condicional)

```tsx
{!customer?.vehicle && mode === "edit" ? (
  // Estado vacío con ícono y mensaje explicativo
  <EmptyVehicleState />
) : (
  // Formulario completo con vehicle_type como primer campo
  <VehicleFormFields />
)}
```

### Fix de runtime: `<SelectItem value="">`

Radix UI prohíbe `value=""` en `<SelectItem>`. Se eliminaron las 9 instancias de `<SelectItem value="">— Seleccione —</SelectItem>`. El placeholder se maneja mediante `<SelectValue placeholder="— Seleccione —" />` que Radix muestra automáticamente cuando el valor del campo es `undefined`.

---

## Pruebas de Verificación

```bash
# Backend — Suite de pruebas
cd backend && python -m pytest tests/ -v -k "customer"

# Frontend — Type check
cd frontend && pnpm exec tsc --noEmit

# Frontend — Linter
cd frontend && pnpm lint
```

### Verificación manual
1. `/customers/{id}/edit` → Pestaña Personal: Nivel Educativo y Medio de Transporte son `<Select>`
2. Pestaña Dirección: Tipo de Vivienda y Posesión de Vivienda son `<Select>`
3. Pestaña Laboral: Método de Pago es `<Select>` y **Frecuencia de Pago** aparece como nuevo campo
4. Pestaña Vehículo: si `customer.vehicle === null` → estado vacío con ícono
5. Si `customer.vehicle` existe → formulario con Tipo de Vehículo como primer campo

### Acción DB pendiente
Si la base de datos contiene datos con `gender = "M"/"F"/"O"`, ejecutar:
```sql
UPDATE customer_details SET gender = 'male'   WHERE gender = 'M';
UPDATE customer_details SET gender = 'female' WHERE gender = 'F';
UPDATE customer_details SET gender = 'other'  WHERE gender = 'O';
```

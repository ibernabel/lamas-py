# Implementación: Formateo de Cédula (000-0000000-0) e Entradas Flexibles en UI

## Objetivo
Estandarizar la visualización de la Cédula de Identidad del cliente en toda la interfaz de usuario (UI) del frontend en el formato `'000-0000000-0'`. Además, permitir que en los campos de creación y edición de formulario se pueda introducir el valor con o sin guiones, mostrándolo siempre formateado en la UI mientras se preserva el almacenamiento limpio (11 dígitos sin guiones) requerido por el esquema Pydantic y la base de datos del backend.

## Componentes Afectados
- `frontend/lib/utils/format-nid.ts` **[NUEVO]**
- `frontend/lib/utils/__tests__/format-nid.test.ts` **[NUEVO]**
- `frontend/lib/validations/customer.schema.ts`
- `frontend/lib/validations/loan-application.schema.ts`
- `frontend/components/customers/CustomerForm.tsx`
- `frontend/components/public-form/steps/identification-step.tsx`
- `frontend/components/customers/CustomerTable.tsx`
- `frontend/components/loans/LoanTable.tsx`
- `frontend/components/customers/CustomerFilters.tsx`
- `frontend/components/customers/CustomerLegacyView.tsx`
- `frontend/app/(dashboard)/customers/[id]/page.tsx`
- `frontend/app/(dashboard)/customers/[id]/edit/page.tsx`
- `frontend/app/(dashboard)/loans/[id]/page.tsx`
- `frontend/components/customers/CustomerTable.test.tsx`
- `frontend/components/loans/LoanTable.test.tsx`
- `frontend/test/validations/loan-application.schema.test.ts`

## Detalles Técnicos

### 1. Funciones Utilitarias (`format-nid.ts`)
- **`formatNid(val: string | null | undefined): string`**:
  - Limpia cualquier carácter no numérico del valor de entrada.
  - Aplica progresivamente la máscara `000-0000000-0` (3 dígitos - 7 dígitos - 1 dígito) según la cantidad de dígitos ingresados.
  - Soporta valores vacíos, nulos, indefinidos o textos con guiones previamente formateados.
- **`cleanNid(val: string | null | undefined): string`**:
  - Remueve guiones y caracteres no numéricos, retornando únicamente los 11 dígitos limpios (`^\d{11}$`) para ser enviados a la API del backend.

### 2. Esquemas de Validación Zod
- **`customerFormSchema` & `customerCreateSchema`**:
  - Se modificaron las reglas de validación del campo `NID` y `referred_by` usando `.refine((val) => cleanNid(val).length === 11)`.
  - Esto permite que el usuario ingrese la cédula con guiones (`001-1234567-8`) o sin guiones (`00112345678`), asegurando que al limpiar existan exactamente 11 dígitos.
- **`identitySchema` (Formulario Público)**:
  - Se actualizó para validar la longitud limpia de 11 dígitos en lugar de forzar regex estricto con guiones.

### 3. Formularios de Entradas de Datos
- **`CustomerForm.tsx`**:
  - El input de `NID` (creación) y `referred_by` aplican `formatNid` en tiempo real en el evento `onChange`.
  - La validación asíncrona de unicidad (`validateNid`) y el envío del formulario (`onSubmit`) aplican `cleanNid` a los valores antes de construir el payload de la API.
- **`identification-step.tsx`**:
  - Formatea dinámicamente el valor en la UI del primer paso del widget público y limpia el NID antes de invocar la API de validación `/nid-validation/`.

### 4. Formateo Universal en Tablas y Vistas
- Se actualizó el renderizado para aplicar `formatNid(customer.nid)` o `formatNid(loan.customer_nid)` en:
  - Tabla de Clientes (`CustomerTable.tsx`)
  - Tabla de Solicitudes de Préstamo (`LoanTable.tsx`)
  - Página de Detalle del Cliente (`customers/[id]/page.tsx`)
  - Encabezado de Edición de Cliente (`customers/[id]/edit/page.tsx`)
  - Vista Legacy (`CustomerLegacyView.tsx`)
  - Página de Detalle de Préstamo (`loans/[id]/page.tsx`)

### 5. Barra de Búsqueda y Filtros (`CustomerFilters.tsx`)
- Se adaptó el filtro de búsqueda por NID en la tabla de clientes de modo que si el usuario escribe `001-1234567-8` o `00112345678`, la búsqueda detecte la cédula y envíe `cleanNid(search)` a los parámetros de la API.

## Pruebas de Verificación
- **Pruebas unitarias de la utilidad**:
  - `formatNid("00112345678")` → `"001-1234567-8"`
  - `formatNid("001-1234567-8")` → `"001-1234567-8"`
  - `cleanNid("001-1234567-8")` → `"00112345678"`
- **Pruebas de componentes y esquemas**:
  - Pruebas unitarias en `CustomerTable.test.tsx`, `LoanTable.test.tsx` y `loan-application.schema.test.ts` actualizadas y pasando exitosamente.

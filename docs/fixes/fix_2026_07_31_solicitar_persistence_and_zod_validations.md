# Fix: Persistencia del Formulario Público /solicitar, Frecuencia de Pago e Internacionalización Zod

**Fecha:** 2026-07-31  
**Estado:** Resuelto y Verificado  
**Componentes Impactados:** Backend (`LoanSubmissionService`, `CustomerService`), Schemas (`Zod`, `Pydantic`), Frontend (`/solicitar`, `/customers/[id]`, `/loans/[id]`)

---

## Síntoma / Requerimiento

1. En la captación pública `/solicitar` (correspondiente a solicitudes registradas como Cliente #33 y Solicitud #55), varios campos enviados no se guardaban o no se mostraban en `/customers/[id]`:
   - Celular (`mobile_phone`).
   - Condición de vivienda y reside desde (`move_in_date`).
   - Tipo de ocupación y fecha de ingreso laboral (`start_date`).
   - Frecuencia de Pago (nómina y cuota de préstamo).
   - Pago mensual de alquiler (`housing_monthly_payment`).
   - Plazo y propósito en listas de solicitudes.
2. Al seleccionar la opción por defecto en los selectores del wizard `/solicitar`, los mensajes de error de Zod aparecían en inglés con sintaxis de enums (`Invalid option: expected one of...`).
3. En modo oscuro, las opciones de los elementos `<select>` no mostraban el texto claramente.
4. Al ingresar una Cédula existente en `/solicitar`, el sistema no estaba rellenando el celular, alquiler ni los datos de empleo.

---

## Causa Raíz

1. `LoanSubmissionService` no persistía teléfonos móviles en la tabla polimórfica `phones`, ni actualizaba `customer_financial_info` al reutilizar un cliente existente. Tampoco enviaba `frequency` a `LoanApplicationDetail`.
2. Zod evaluaba la cadena vacía `""` enviada por `<select>` como un enum inválido en lugar de un valor `undefined` requerido, ejecutando el mensaje `invalid_enum_value` en inglés.
3. Los elementos `<select>` y `<option>` carecían de clases Tailwind explícitas de color de texto (`text-foreground bg-background`).
4. El endpoint `validate_nid` (`customer_service.py`) no incluía en el payload `existing_customer` el número celular, alquiler ni los datos laborales.

---

## Solución Aplicada

### 1. Backend (`backend/app/services/`)
- **`LoanSubmissionService`**:
  - Persiste el número celular en la tabla polimórfica `phones` (`type="mobile"`).
  - Calcula `move_in_date` (`date.today() - timedelta(days=30*months)`) desde los meses en residencia.
  - Persiste `occupation_type`, `start_date` y `payment_frequency` en `CustomerJobInfo`.
  - Persiste `monthly_housing_payment` en `CustomerFinancialInfo` (para altas y modificaciones de clientes).
  - Persiste `frequency` en `LoanApplicationDetail`.
- **`CustomerService` (`validate_nid`)**:
  - Retorna el objeto `existing_customer` completo con celular, vivienda, alquiler, ocupación, cargo, empresa, salario, banco, frecuencia y fecha de ingreso.
- **DTOs Pydantic (`loan_application.py`)**:
  - Se añadieron `term`, `purpose` y `frequency` a `LoanApplicationListItem`.

### 2. Frontend (`frontend/`)
- **Esquemas Zod (`loan-application.schema.ts` y `customer.schema.ts`)**:
  - Preprocesamiento universal `z.preprocess((val) => (val === "" || val === null ? undefined : val), ...)` para todos los enums.
  - Asignación de `errorMap` con mensajes 100% en español dominicano.
- **Componentes Step (`personal-step.tsx`, `employment-step.tsx`, `request-consent-step.tsx`, `identification-step.tsx`)**:
  - Adición de selector **Frecuencia de Pago del Préstamo** en Paso 5.
  - Adición de selector **Frecuencia de Cobro / Pago** en Paso 3.
  - Eliminación del campo de dependientes (`dependents_count`).
  - Clases Tailwind explícitas `bg-background text-foreground` en `<select>` y `<option>`.
  - Autocompletado de todos los campos en `identification-step.tsx` al consultar por Cédula existente.
- **Detalle Cliente y Préstamo (`/customers/[id]` y `/loans/[id]`)**:
  - Muestra celular, `Pago Mensual Alquiler`, `Condición de Posesión` traducida, `Frecuencia de Pago` formateada y `Propósito del Préstamo` traducido.

### 3. Reparación de Datos
- Creado y ejecutado el script `backend/scripts/repair_customer_33.py` para sincronizar los registros del Cliente #33 y la Solicitud #55.

---

## Verificación

- Pruebas de integración actualizadas en `backend/tests/integration/test_loan_submit_flow.py`.
- Formulario `/solicitar` validado con mensajes en español y autocompletado funcional.

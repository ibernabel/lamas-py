# Fix: SelectItem value="" — Radix UI Runtime Error

**Fecha**: 2026-07-30  
**Severidad**: 🔴 Runtime Error (bloquea renderizado del formulario)  
**Componente**: `frontend/components/customers/CustomerForm.tsx`

---

## Síntoma

```
Error: A <Select.Item /> must have a value prop that is not an empty string.
This is because the Select value can be set to an empty string to clear the 
selection and show the placeholder.

  at SelectItem (components/ui/select.tsx:109:5)
  at CustomerForm (components/customers/CustomerForm.tsx:419:25)
```

El formulario de edición de cliente (`/customers/[id]/edit`) era **completamente inaccesible** al navegar a la pestaña Personal.

---

## Causa Raíz

Al agregar opciones placeholder tipo "— Seleccione —" en los nuevos `<Select>`, se incluyeron como `<SelectItem value="">`:

```tsx
// ❌ INCORRECTO — Radix UI no permite value="" en SelectItem
<SelectContent>
  <SelectItem value="">— Seleccione —</SelectItem>
  <SelectItem value="male">Masculino</SelectItem>
  ...
</SelectContent>
```

**Por qué falla**: Radix UI reserva `value=""` (string vacío) para representar el estado "nada seleccionado" del `<Select>`. Si un `<SelectItem>` usa ese valor, genera ambigüedad entre "el usuario seleccionó la opción vacía" y "no hay selección". Radix lanza el error en runtime como salvaguarda.

---

## Solución Aplicada

Eliminar **todas** las instancias de `<SelectItem value="">` (9 ocurrencias). El placeholder ya se gestiona correctamente mediante `<SelectValue placeholder="...">`:

```tsx
// ✅ CORRECTO
<Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
  <SelectTrigger>
    <SelectValue placeholder="— Seleccione —" />  {/* ← Aparece automáticamente cuando value es undefined */}
  </SelectTrigger>
  <SelectContent>
    {/* Sin SelectItem de valor vacío */}
    <SelectItem value="male">Masculino</SelectItem>
    <SelectItem value="female">Femenino</SelectItem>
    <SelectItem value="other">Otro</SelectItem>
  </SelectContent>
</Select>
```

**Mecanismo de limpieza del valor**: `onValueChange={(v) => field.onChange(v || undefined)}` — si de alguna forma llega un string vacío, se convierte en `undefined`, lo que activa el placeholder automáticamente.

---

## Archivos Modificados

- `frontend/components/customers/CustomerForm.tsx` — Eliminadas 9 líneas `<SelectItem value="">— Seleccione —</SelectItem>`

---

## Verificación

El formulario `/customers/{id}/edit` renderiza sin errores en la consola del navegador. Todos los `<Select>` muestran el placeholder "— Seleccione —" correctamente cuando el campo no tiene valor asignado.

---

## Aprendizaje

> **Regla Shadcn/Radix**: Nunca usar `<SelectItem value="">`. El estado "vacío/sin selección" se representa con `undefined` o `null` en el campo — nunca con un string vacío como valor de opción.

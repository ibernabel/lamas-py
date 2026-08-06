# Parser de WhatsApp: regex multi-formato para Android e iOS

El parser de importación de conversaciones de WhatsApp debe soportar dos formatos de exportación, según el sistema operativo del asesor:

**Android** (con corchetes):
```
[DD/MM/AA HH:MM:SS] Nombre del Remitente: Mensaje
```

**iPhone/iOS** (sin corchetes):
```
DD/MM/AA, HH:MM - Nombre del Remitente: Mensaje
```

El sistema no puede asumir un solo formato — los asesores pueden usar Android o iPhone.

## Estrategia de parsing

1. **Detección automática de formato**: El parser intenta el regex de Android primero; si no hay matches, intenta el de iOS.
2. **Normalización**: Todos los mensajes se normalizan al mismo schema interno antes de almacenar.
3. **Elementos especiales manejados**:
   - Archivos multimedia: `<Archivo adjunto: nombre.ext>` → se almacena como referencia, sin el archivo real.
   - Mensajes del sistema: (cambios de grupo, llamadas) → se descartan o etiquetan como `system`.
   - Mensajes multi-línea: Las líneas sin marca de tiempo se concatenan al mensaje anterior.
4. **Sanitización PII**: Regex simples aplicados al `raw_message` antes de almacenar:
   - Números de teléfono: `\b(\+?1?\s?)?(\d{3}[\s\-.]?)?\d{3}[\s\-.]?\d{4}\b`
   - NIDs dominicanos: `\b\d{3}-?\d{7}-?\d{1}\b`
   - Emails: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`

## Consequences

- El matching entre el remitente del chat y un `Customer` en FRM se hace por nombre (fuzzy matching) ya que WhatsApp Business no incluye el NID en el export.
- El fuzzy matching de nombres es impreciso — se debe diseñar un flujo de confirmación donde el importador valida el match antes de guardar.
- NER (Named Entity Recognition) para detección de nombres propios en el texto es trabajo futuro.
- Los asesores exportan desde WhatsApp Business (no personal) — el remitente del asesor aparece con el nombre del perfil de empresa.

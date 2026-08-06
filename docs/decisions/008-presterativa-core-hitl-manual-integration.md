# Presterativa es el Core System; integración FRM↔Core es HITL manual, no automatizada

El sistema Core donde viven los préstamos activos (disbursamiento, cobro, mora) es **Presterativa**, instalado en Windows en las instalaciones del cliente. Presterativa no expone API ni permite integración programática directa.

La sincronización entre FRM y Presterativa es manual y unidireccional: cuando FRM aprueba una solicitud, genera una `CoreTask` en la cola HITL. Un operador humano lee la tarea en FRM, ejecuta la acción correspondiente manualmente en Presterativa, y marca la tarea como completada en FRM.

El `CoreTaskQueue` en FRM no es un bus de integración — es un registro de tareas manuales pendientes para el operador.

## Considered Options

- **Data Warehouse read-only desde la BD de Presterativa**: Técnicamente posible si se obtienen las credenciales y acceso de red a la BD de Windows. Permitiría que FRM consulte saldos, pagos y estado de mora en tiempo real. Requiere investigación de viabilidad (motor de BD, permisos, VPN/red).
- **API REST sobre Presterativa**: Descartado. Presterativa no expone API y no es modificable.
- **Migración de Presterativa a FRM**: Fuera de alcance actual. Presterativa es el sistema en producción del negocio.

## Consequences

- FRM no tiene visibilidad del estado del préstamo después del disbursamiento, a menos que el operador lo actualice manualmente.
- La cola HITL (`CoreTaskQueue`) es el único mecanismo de coordinación entre sistemas.
- La idea del Data Warehouse (lectura de BD de Presterativa) queda como backlog técnico a evaluar.
- El estado de mora, pagos y saldo del préstamo activo **no existe en FRM** — es información que vive exclusivamente en Presterativa.

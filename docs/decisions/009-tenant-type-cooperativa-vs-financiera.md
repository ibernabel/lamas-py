# Multi-tenancy: el tipo de tenant (Cooperativa vs Financiera) define el modelo de cliente

El FRM fue originalmente construido para una Cooperativa (que maneja ahorros + préstamos) y ahora también debe servir a Financieras (solo crédito). Esta diferencia impacta el modelo de datos del Customer: en una Cooperativa, el cliente puede tener perfil de ahorro; en una Financiera, solo tiene perfil de crédito.

El `CooperativeProfile` en el modelo de datos existe para manejar los casos de tenants tipo Cooperativa. No es un tipo de Customer — es una extensión del perfil de cliente específica al contexto de Cooperativa.

Los Customers son siempre personas naturales. Las personas jurídicas (empresas) solo pueden ser Tenants, nunca Customers.

## Considered Options

- **Eliminar CooperativeProfile**: Descartado. El modelo cubre un caso de negocio real y activo.
- **Discriminador en Customer (`customer_type: NATURAL | LEGAL`)**: Descartado. Los Customers son siempre personas naturales; no es necesario.
- **Tenant por despliegue (single-tenant)**: A confirmar en sesión posterior. Si cada Tenant tiene su propia instancia del FRM, el `tenant_id` puede ser innecesario en el schema.

## Consequences

- `CooperativeProfile` permanece en el modelo y debe ser documentado y expuesto via API.
- El concepto de "Tenant" necesita un modelo explícito en FRM si se contempla multi-tenant en una sola instancia.
- La UI debe condicionar la visibilidad de secciones de ahorro según el tipo de Tenant configurado.

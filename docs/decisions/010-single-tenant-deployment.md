# Despliegue single-tenant: una instancia del FRM por cliente

El FRM se despliega como instancia dedicada por cada cliente (Cooperativa o Financiera). No hay arquitectura multi-tenant en una sola instancia compartida.

Cada instancia tiene su propia base de datos PostgreSQL y su propio contenedor Docker. No existe `tenant_id` en ninguna tabla del schema de datos.

## Considered Options

- **Multi-tenant en una sola instancia (SaaS)**: Descartado. Requiere Row-Level Security en todas las tablas, aislamiento de datos entre tenants, complejidad de billing y onboarding. El modelo de negocio actual es de implementación por proyecto, no SaaS.
- **Single-tenant por instancia (elegido)**: Más simple de mantener, depurar y garantizar aislamiento de datos. Escalable añadiendo instancias independientes cuando se incorpora un nuevo cliente.

## Consequences

- No hay `tenant_id` en el schema — simplifica modelos, queries y permisos.
- El onboarding de un nuevo cliente implica provisionar un nuevo servidor/contenedor.
- Si en el futuro se migra a SaaS, el schema requiere una migración significativa (añadir `tenant_id` a todas las tablas y RLS).
- La configuración de "tipo de tenant" (Cooperativa vs Financiera) se maneja vía variables de entorno o `SystemConfig`, no vía discriminador de schema.

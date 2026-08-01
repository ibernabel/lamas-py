# Fix: Ordenamiento Descendente de Tablas por ID y Fecha (Más Reciente Primero)

**Fecha:** 2026-07-31  
**Proyecto:** LAMaS (Loan Applications Management System)  
**Estado:** ✅ Resuelto  

---

## 1. Síntoma
- Las tablas del dashboard (`/customers`, `/loans`, documentos de clientes, cola de tareas) mostraban desorden respecto al registro recién creado.
- En particular, al registrar una nueva solicitud desde el formulario público, el nuevo cliente (#33) aparecía en la **6ta posición** en la tabla `/customers` en lugar de la **1ra posición** (fila superior de la primera celda).
- Inicialmente se interpretó `ASC` como "más reciente primero", pero incluso tras cambiar a `created_at DESC`, registros importados desde CSV o creados previamente con marcas de tiempo en UTC evaluaban por delante del nuevo cliente.

---

## 2. Causa Raíz
1. **Interpretación Inicial de Direccionalidad:** `ASC` (ascendente) ordena de menor a mayor (fechas más antiguas primero), mientras que `DESC` (descendente) ordena de mayor a menor (fechas más recientes primero).
2. **Inconsistencias de `created_at` en Datos Importados:** En clientes importados desde CSV o sistemas heredados, los valores de `created_at` podían tener fechas fijas o ligeras diferencias de zona horaria (UTC vs Local), provocando que un cliente con un ID autoincremental superior (#33) tuviera una marca de tiempo inferior a registros existentes.
3. **Falta de Ordenamiento Secundario por ID:** El servicio de búsqueda de clientes ordenaba únicamente por `Customer.created_at.desc()`. Sin un ordenamiento explícito por la clave primaria autoincremental `Customer.id.desc()`, la base de datos no garantizaba la posición del registro recién creado.

---

## 3. Solución Aplicada
Se actualizaron las consultas en los servicios y controladores API del backend para ordenar explícitamente por la clave primaria autoincremental descendente (`id DESC`), asegurando determinísticamente que el registro más reciente recién insertado (ej. Cliente #33 o Solicitud #55) ocupe la **posición #1 (fila superior, celda 1)**:

1. **Clientes (`Customer`)**:
   - `backend/app/services/customer_service.py`: Se cambió la cláusula `order_by` a `Customer.id.desc()`.
2. **Solicitudes de Préstamo (`LoanApplication`)**:
   - `backend/app/services/loan_application_service.py`: Se cambió la cláusula `order_by` a `LoanApplication.id.desc()`.
3. **Documentos de Clientes (`CustomerDocument`)**:
   - `backend/app/api/v1/endpoints/documents.py`: Se cambió `order_by` a `CustomerDocument.id.desc()`.
4. **Cola de Tareas HITL (`CoreTaskQueue`)**:
   - `backend/app/api/v1/endpoints/task_queue.py`: Se mantuvo `CoreTaskQueue.id.desc()`.
5. **Catálogo de Riesgos (`CreditRiskCategory` / `CreditRisk`)**:
   - `backend/app/api/v1/endpoints/credit_risks.py`: Se agregaron ordenamientos explícitos por `created_at.desc()`.
6. **Vista Detalle de Préstamo (Frontend UI)**:
   - `frontend/app/(dashboard)/loans/[id]/page.tsx`: Se ordenaron las notas del préstamo para mostrar la nota más reciente primero (`b.created_at - a.created_at`).

---

## 4. Archivos Modificados
- `backend/app/services/customer_service.py`
- `backend/app/services/loan_application_service.py`
- `backend/app/api/v1/endpoints/documents.py`
- `backend/app/api/v1/endpoints/task_queue.py`
- `backend/app/api/v1/endpoints/credit_risks.py`
- `frontend/app/(dashboard)/loans/[id]/page.tsx`

---

## 5. Verificación
- Verificación de consultas SQLModel: `Customer.id.desc()` retorna el registro #33 en el primer índice (`items[0]`).
- Verificación en `/customers` y `/loans`: El registro recién creado aparece en la celda superior izquierda/primera fila de cada tabla.

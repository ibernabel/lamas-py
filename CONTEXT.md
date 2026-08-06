# FRM — Financial Relationship Management

> **Nota**: Este es un sistema single-tenant. Cada Cooperativa o Financiera tiene su propia instancia desplegada. No hay `tenant_id` en el schema de datos.

Sistema central de gestión de relaciones financieras con el cliente. Actúa como repositorio único (SSOT) del universo de datos del cliente: demográfico, financiero, conversacional y de ciclo de vida. Contiene el módulo de origination de crédito (LAMaS) como subcomponente.

## Language

### Sistema

**FRM (Financial Relationship Management)**:
El sistema completo. Nombre canónico del producto. Engloba todas las capas: origination, datos multidimensionales, conversacional y analítica.
_Avoid_: LAMaS (como nombre del sistema completo), CRM, LOS

**LAMaS (Loan Applications Management System)**:
El submódulo de origination de crédito dentro del FRM. Gestiona el ciclo de solicitud, evaluación y aprobación de préstamos. No es el nombre del sistema completo.
_Avoid_: LAMaS cuando se refiere al sistema completo

**Presterativa**:
Sistema Core externo instalado en Windows. Fuente de verdad operativa para préstamos activos: disbursamiento, cobro y mora. No expone API. La sincronización con FRM es manual y unidireccional: el operador registra en Presterativa lo que FRM aprueba.
_Avoid_: Core System (usar Presterativa directamente), sistema legacy

**CreditGraph**:
Motor de análisis de crédito externo (headless, stateless). Recibe datos Zero-PII de FRM y devuelve una decisión con IRS Score, nivel de riesgo y narrativa. No almacena datos; FRM guarda la respuesta completa.
_Avoid_: CreditFlow, motor de IA

### Entidades de Negocio

**Customer**:
Persona natural que solicita o tiene crédito activo con el tenant. Siempre persona física. Nunca una empresa ni cooperativa.
_Avoid_: Client, Borrower, Applicant (Applicant es el customer durante el proceso de solicitud)

**Tenant**:
La empresa u organización que opera el FRM. Puede ser una Cooperativa o una Financiera. Es la entidad propietaria del sistema, no un cliente.
_Avoid_: Client (para referirse al tenant), organización

**Cooperativa**:
Tipo de tenant que ofrece tanto ahorros como préstamos a sus socios. En el contexto de una Cooperativa, el Customer se denomina **Socio**. Tiene acceso a cuentas de ahorros, balance, aportaciones y perfil de crédito.
_Avoid_: Cooperative (usar español)

**Socio**:
Nombre que toma el Customer cuando el tenant es una Cooperativa. Es el mismo concepto (persona natural, NID, datos demográficos) con campos adicionales del `CooperativeProfile`: cuenta de ahorros, balance, aportaciones mensuales, antigüedad como socio.
_Avoid_: Miembro, Afiliado

**CooperativeProfile**:
Extensión del perfil de Customer específica para tenants tipo Cooperativa. Contiene: `member_number`, cuenta(s) de ahorros, `share_balance` (aportes), `savings_balance`, `outstanding_loan_balance`. Propiedad calculada: `net_exposure`. Le falta: `join_date`, `monthly_contribution`. No existe en tenants tipo Financiera.
_Avoid_: SavingsProfile, MemberProfile

**Convenio**:
Acuerdo entre una Cooperativa (tenant) y una empresa empleadora. Los empleados de esa empresa son admitidos como socios automáticamente. Representado en `CooperativeProfile.b2b_company_id` → FK a `companies`. Ejemplo: la Cooperativa tiene convenio con empresa X; todos los empleados de X son socios elegibles.
_Avoid_: Partnership, acuerdo corporativo

**Financiera**:
Tipo de tenant que ofrece únicamente productos de crédito. El customer de una Financiera solo tiene perfil de crédito.
_Avoid_: Prestamista, casa de préstamos

**LoanApplication (Solicitud)**:
El proceso formal de solicitud de crédito que un Customer inicia en FRM. Tiene un ciclo de vida definido: received → verified → analyzed → approved/rejected.
_Avoid_: Loan (Loan es el préstamo activo en Presterativa, no en FRM), Application

**Loan (Préstamo)**:
El préstamo activo disbursado. Existe en Presterativa, no en FRM. FRM solo conoce el resultado de la aprobación; el préstamo como instrumento financiero vive en Presterativa.
_Avoid_: usar Loan para referirse a una LoanApplication en FRM

**IRS Score**:
Puntuación de riesgo crediticio calculada por CreditGraph (0-100). Determina la decisión automática: ≥85 Aprobado, 60-84 Revisión Manual, <60 Rechazado.
_Avoid_: Credit Score, Score, Rating

**NID (Número de Identificación)**:
Cédula de Identidad dominicana. Formato canónico: `000-0000000-0`. Identificador único del Customer en FRM.
_Avoid_: Cédula (usar NID en código, Cédula en UI)

### Operaciones

**HITL (Human-In-The-Loop)**:
Flujo donde el sistema FRM genera una tarea que un operador humano debe ejecutar manualmente en Presterativa. FRM no puede automatizar esto; el humano es el puente.
_Avoid_: Manual task, aprobación manual

**CoreTask**:
Una tarea pendiente en la cola HITL. Representa una acción que el operador debe ejecutar manualmente en Presterativa: crear préstamo, registrar pago, actualizar estado de mora. Es un checklist operativo, no una integración programática.
_Avoid_: Task, Job, Queue Item

**CustomerFinancialStatus**:
Estado financiero actual del Customer derivado del `PresternativaSync`. Enum: `UNKNOWN` | `NO_ACTIVE_LOAN` | `CURRENT` | `IN_MORA` | `MORA_RESOLVED` | `IN_LEGAL` | `CHARGED_OFF` | `CLOSED`. Los estados `IN_LEGAL` y `CHARGED_OFF` bloquean nuevas solicitudes automáticamente sin llamar a CreditGraph.
_Avoid_: credit status, payment status

**PreFilter**:
Capa de reglas de negocio simples que se ejecutan en FRM antes de invocar a CreditGraph. Bloquea o escala solicitudes basadas en condiciones objetivas: `CustomerFinancialStatus`, validez del NID, duplicados activos, monto máximo. Las reglas son configurables via `SystemConfig`. No reemplaza a CreditGraph — solo evita llamadas innecesarias.
_Avoid_: Business rules engine, validation layer

**PresternativaSync**:
Proceso de importación de archivos exportados desde Presterativa. Opera en dos modos: (1) Excel bulk — archivo con todos los clientes, usado para actualizar el estado financiero del portafolio; (2) DOCX individual — historial de pagos por cliente. El matching con Customers en FRM se hace por NID. El formato exacto de ambos archivos está en fase de exploración.
_Avoid_: Sync en tiempo real, Integration (implican conexión continua)

**frm-contracts**:
Paquete compartido dentro del monorepo `frm-system` que contiene los tipos y contratos de datos usados entre servicios: Pydantic schemas (Python) y TypeScript interfaces (TS). Es el contrato formal entre `lamas`, `creditgraph` y `frm-chats`.
_Avoid_: shared-types, common

**Zero-PII Contract**:
Contrato de datos que prohíbe enviar información de identificación personal (NID, nombre, email, teléfono) a servicios externos. FRM envía un `applicant_hash` (SHA-256 del NID) en lugar de datos reales.
_Avoid_: Privacy contract, anonymization

**ConversationalLog**:
Registro de una interacción (mensaje) entre un asesor y un Customer a través de un canal (WhatsApp, Email). Almacenado sin PII después del proceso de sanitización.
_Avoid_: Chat, Message, Log

**Shadow Risk**:
Perfil de señales de riesgo conductual del Customer capturadas durante el llenado del formulario: velocidad de tipeo, pegado de portapapeles, huellas del dispositivo, ratio DTI calculado. Complementa el IRS Score.
_Avoid_: Behavioral risk, fraud signals

### Canales

**WhatsApp Business (Manual Export)**:
Flujo actual de ingesta conversacional. El asesor exporta el chat `.txt` desde WhatsApp Business y lo importa al FRM. El sistema sanitiza PII antes de almacenar.
_Avoid_: WhatsApp API (eso es el flujo futuro)

**Chatwoot**:
Plataforma de mensajería omnicanal open-source. Candidata como capa conversacional futura para reemplazar el flujo de importación manual de WhatsApp.
_Avoid_: Chat platform (ser específico)

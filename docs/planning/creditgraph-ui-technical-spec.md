# Requerimiento Técnico y Especificación de Integración: UI/UX CreditGraph AI en LAMaS

## 📌 1. Contexto y Objetivos

El motor de inteligencia artificial **CreditGraph** (`financial-risk-agent-graph`) ejecuta un análisis probabilístico y determinista basado en grafos de conocimiento y agentes inteligentes para la evaluación del riesgo crediticio en solicitudes de préstamos.

Este documento establece la especificación técnica para consumir los datos reales generados por el backend de CreditGraph y presentarlos en la plataforma **LAMaS (Frontend Next.js)** tanto en el **Sidebar de Resumen** como en la pestaña de **Análisis CreditGraph**, eliminando los datos de prueba (*mockdata*) e implementando una interfaz de usuario (*UI/UX*) de nivel empresarial.

---

## 🔄 2. Arquitectura del Flujo de Datos

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────────┐
│     LAMaS Frontend      │  HTTP   │      LAMaS Backend       │  HTTP   │   CreditGraph Engine    │
│    (Next.js 16 + UI)    │ ──────> │    (FastAPI + SQLModel)  │ ──────> │   (LangGraph + Agentes) │
└─────────────────────────┘         └──────────────────────────┘         └─────────────────────────┘
            │                                     │                                   │
            │  1. GET /customers/{id}/analysis    │  2. Consultar CreditGraphAnalysis │
            │ <────────────────────────────────── │ <──────────────────────────────── │
            │                                     │                                   │
            │  3. Render UI / Radar / Sidebar     │                                   │
            ▼                                     ▼                                   ▼
```

---

## 📊 3. Especificación del Contrato de Datos (API Payload & Response)

### A. Datos Enviados al Análisis (`AnalysisRequest` - Zero-PII Contract)
Desde LAMaS hacia CreditGraph (Garantía de Cero Datos PII):
- **Cliente Anonimizado:** `applicant_hash` (Pseudónimo Hashed SHA-256), `declared_salary` (Salario declarado en DOP), `dependents_count` (Número de dependientes), `employer_sector` (Sector económico de la empresa), `employment_tenure_months` (Antigüedad laboral en meses), `residence_type` (Tipo de residencia: `OWNED`, `RENTED`), `geo_zone` (Zona geográfica/macroprovincia). *Nota: Se excluye rigurosamente Cédula, Nombre completo, Correo, Teléfono y Dirección exacta.*
- **Solicitud:** Monto solicitado (`requested_amount`), Plazo en meses (`term_months`), Tipo de producto (`product_type`: `PERSONAL_LOAN`, `AUTO`, etc.).
- **Métricas Financieras Extraídas (Sin PII):** Ingresos bancarios consolidados (`detected_bank_income`), promedio de balance mensual (`average_balance`), total de obligaciones detectadas (`monthly_obligations`). *Nota: Se envían métricas numéricas agregadas previamente desinfectadas de PII.*

### B. Objeto Devuelto por el Servicio (`AnalysisResponse / CreditGraphAnalysis`)

| Campo Backend / DB | Tipo | Descripción / Propósito UI |
| :--- | :--- | :--- |
| `decision` | `Enum` | `APPROVED` \| `REJECTED` \| `MANUAL_REVIEW` \| `APPROVED_PENDING_REVIEW` |
| `irs_score` | `Integer` | Internal Risk Score (Escala 0 - 100 o convertida a 300 - 900) |
| `confidence` | `Float` | Porcentaje de confianza del modelo IA (0.0 - 1.0) |
| `risk_level` | `Enum` | `LOW` (🟢) \| `MEDIUM` (🟡) \| `HIGH` (🔴) \| `CRITICAL` (🔴) |
| `suggested_amount` | `Float?` | Monto sugerido ajustado por riesgo en DOP |
| `suggested_term` | `Integer?` | Plazo sugerido ajustado en meses |
| `irs_breakdown` | `Object` | Desglose en 5 dimensiones (0-100 por pilar):<br>1. `credit_history`<br>2. `payment_capacity`<br>3. `stability`<br>4. `collateral`<br>5. `payment_morality` |
| `financial_analysis` | `Object` | `detected_income` (detectado en banco), `reported_income` (declarado), `discrepancy_ratio` (diferencia %), `flags` (alertas) |
| `osint_validation` | `Object` | `business_found` (booleano), `digital_veracity_score` (0.0-1.0), `sources_checked` (ONAPI, RNC, DGII, Redes) |
| `narrative_es` | `String` | Explicabilidad en texto narrativo estructurado en español |
| `shadow_risk_score` | `Float?` | Detección de comportamiento atípico en la sombra |
| `collection_route` | `String?` | Estrategia preventiva de cobro recomendada |

---

## 🎨 4. Requerimientos de Diseño UI/UX por Sección

### A. Sidebar de Resumen (Pestaña "Resumen")
- **Widget Rápido:** Tarjeta con gradiente sutil y borde en color primario.
- **Score IRS & Anillo de Porcentaje:** Indicador gráfico con badge dinámico de riesgo (`Bajo`, `Medio`, `Alto`).
- **3 Indicadores Críticos:**
  1. Dictamen Rápido (Aprobación / Revisión Senior).
  2. Capacidad de Pago & Cobertura de Cuota.
  3. Alerta de Discrepancia Financiera (si `detected_income` vs `reported_income` difieren > 15%).
- **Acción:** Botón de un solo clic que conmuta hacia la pestaña de **Análisis CreditGraph**.

### B. Pestaña Completa "Análisis CreditGraph"

#### 1. Hero Summary Header:
- Banner principal con el score de riesgo, nivel de confianza (%), ID de Análisis, tiempo de procesamiento (`execution_time_ms`) y estado de aprobación.
- Enlaces rápidos para solicitar **Re-análisis Forzado** (si se han subido nuevos documentos).

#### 2. Matriz Radar del Perfil Crediticio (5 Pilares IRS):
- Implementación con `Recharts` (`RadarChart`) comparando los 5 pilares:
  - **Historial Crediticio** (`credit_history`)
  - **Capacidad de Pago** (`payment_capacity`)
  - **Estabilidad Laboral y Residencial** (`stability`)
  - **Garantías & Colateral** (`collateral`)
  - **Moral de Pago** (`payment_morality`)

#### 3. Módulo de Verificación Financiera Bancaria:
- Cuadro comparativo entre:
  - **Ingreso Declarado:** (Capturado en el formulario).
  - **Ingreso Detectado Real:** (Extraído del PDF del estado de cuenta bancario por la IA).
  - **Razón de Discrepancia (%):** Badge verde si `< 10%`, amarillo si `10-25%`, rojo si `> 25%`.

#### 4. Módulo OSINT & Veracidad Digital:
- Medidor de Veracidad Digital (`digital_veracity_score` en %).
- Lista de Fuentes Verificadas con íconos de estado (`ONAPI`, `DGII / RNC`, `Verificación Telefónica`, `Presencia Web / Negocio`).

#### 5. Explicabilidad Narrativa de IA (`narrative_es`):
- Tarjeta de lectura estructurada con ícono de cerebro IA, formateada con párrafos limpios destacando los motivos de la decisión y recomendaciones operativas para el oficial de crédito.

#### 6. Cobranza Preventiva & Riesgo en la Sombra:
- Indicador de `collection_route` recomendada (ej: *Recordatorio preventivo vía WhatsApp el día -3 del vencimiento*).

---

## 🗓️ 5. Fases de Implementación Recomendadas

| Fase | Tarea | Componentes Involucrados |
| :--- | :--- | :--- |
| **Fase 1** | Creación de tipos de TypeScript | `frontend/lib/api/types.ts` (`CreditGraphAnalysisRead`, `IRSBreakdown`, `OSINTValidation`, `FinancialAnalysis`) |
| **Fase 2** | Hook de consumo de API | `frontend/hooks/use-creditgraph.ts` (Fetch de análisis por `customerId` o `loanId`) |
| **Fase 3** | Conexión UI Sidebar con datos reales | `frontend/components/customers/CreditGraphSummaryCard.tsx` |
| **Fase 4** | Desarrollo UI/UX completa de pestaña Análisis | `frontend/components/customers/CustomerCreditGraphAnalysis.tsx` (Radar, OSINT, Discrepancia) |

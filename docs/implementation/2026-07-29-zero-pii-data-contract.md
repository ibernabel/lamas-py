# Implementación: Contrato de Datos Zero-PII (LAMaS ↔ CreditGraph AI)

**Fecha:** 29 de Julio, 2026  
**Autor:** Idequel Bernabel  
**Estado:** ✅ Implementado y Verificado  

---

## 📌 1. Objetivo y Alcance

Garantizar la protección total de Datos de Identificación Personal (PII) en la integración entre **LAMaS** (`lamas-py`) y el motor de IA **CreditGraph AI** (`financial-risk-agent-graph`), refactorizando el contrato de datos `AnalysisRequest` para operar bajo un esquema **Zero-PII**.

---

## 🛠️ 2. Detalles Técnicos de la Implementación

### A. Sistema LAMaS (`lamas-py`)
- **`backend/app/services/creditgraph_service.py`**:
  - Eliminación de atributos PII (`full_name`, `cedula`, `email`, `phone`, `address`).
  - Generación de pseudónimo anónimo `applicant_hash` usando SHA-256 (`f"anon_app_{sha256(nid)[:16]}"`).
  - Extracción limpia de variables sociodemográficas y financieras agregadas: `declared_salary`, `housing_type`, `is_self_employed`.
- **`docs/planning/creditgraph-ui-technical-spec.md`**:
  - Actualización de la Sección 3.A para reflejar el contrato Zero-PII.
- **`backend/tests/test_creditgraph_api.py`**:
  - Inclusión de aserciones automatizadas comprobando la ausencia de `full_name`, `cedula` y `email` en la llamada HTTP a CreditGraph.

### B. Sistema CreditGraph AI (`financial-risk-agent-graph`)
- **`app/api/models.py`**:
  - Refactorización de la clase `ApplicantData`: eliminación de `id`, `full_name`, `date_of_birth`, `declared_address`, `email`, `phone`.
  - Incorporación de `applicant_hash`, `declared_salary`, `dependents_count`, `housing_type`, `is_self_employed`, `employer_sector`, `geo_zone`.
  - Validador Pydantic `@field_validator("applicant_hash")` que rechaza patrones de Cédula (`\d{3}-\d{7}-\d{1}`) o correo electrónico (`@`).
  - Actualización del esquema de ejemplo en `AnalysisRequest.Config.json_schema_extra`.

---

## 🧪 3. Verificación de QA

- **Aserción Zero-PII en cliente de test:** Verificado que la carga enviada a la API externa carezca de campos PII y contenga `applicant_hash`.
- **Validación en Endpoint:** Comprobado que la API responda con HTTP 422 si se intenta enviar PII en campos de texto libre o hash.

# ADR 003: Contrato de Datos Zero-PII para Integración con CreditGraph AI

- **Estado:** Aprobado
- **Fecha:** 29 de Julio, 2026
- **Autor:** Idequel Bernabel

## Contexto

El motor de inteligencia artificial **CreditGraph AI** (`financial-risk-agent-graph`) ejecuta análisis de riesgo crediticio basados en grafos de conocimiento y LLMs. En la implementación inicial, la payload `AnalysisRequest` incluía datos PII del cliente (`full_name`, `cedula`, `email`, `phone`, `declared_address`). La transmisión y procesamiento de datos de identificación personal directamente hacia modelos de lenguaje plantea riesgos de privacidad y cumplimiento normativo.

## Decisión

Adoptar un **Contrato de Datos Zero-PII Estricto** para toda la comunicación entre LAMaS y CreditGraph AI:
1. **LAMaS como Custodio Único de PII:** LAMaS almacena la identidad real en su base de datos local y genera un pseudónimo determinista SHA-256 (`applicant_hash`).
2. **Payload Anonimizado:** LAMaS transmite únicamente métricas numéricas y categóricas agregadas (`declared_salary`, `dependents_count`, `housing_type`, `is_self_employed`, `employer_sector`, `geo_zone`).
3. **Validación en Ingestión (CreditGraph):** CreditGraph implementa validadores Pydantic estrictos para detectar y rechazar con HTTP 422 cualquier payload con formatos de Cédula o Email.

## Consecuencias

### Positivas
- Cumplimiento total de estándares de protección de datos personales.
- Eliminación de riesgos de fuga de PII en logs, almacenamiento de auditoría o prompts de LLMs.
- Evaluación de riesgo crediticio puramente objetiva sin sesgos por identidad personal.

### Mitigadas / Trade-offs
- La re-identificación de reportes requiere consulta a la base de datos de LAMaS mediante `loan_application_id` o recalcular el hash de la Cédula.

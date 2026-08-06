---
name: code-pipeline
description: Lanza el pipeline completo de Uncle Bob (Specifier → Coder → Refactorer → Architect → QA) usando el orquestador.
---

# Code Pipeline (Uncle Bob style)

Quiero implementar una funcionalidad usando el pipeline completo de agentes.

## Especificaciones informales

$ARGUMENTS

---

Invoca al agente **orchestrator** y sigue estrictamente el flujo:

1. Specifier genera Gherkin + plan de QA
2. Yo reviso / apruebo el Gherkin
3. Coder implementa
4. Refactorer limpia
5. Architect endurece (mutation + cobertura)
6. QA ejecuta el plan

Al final dame un resumen claro de lo realizado y de los puntos que debo revisar manualmente.
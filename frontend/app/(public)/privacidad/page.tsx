import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/solicitar"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al formulario
        </Link>
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <ShieldCheck className="h-5 w-5" />
          <span>Ley 172-13 Cumplimiento Garantizado</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 sm:p-10 shadow-sm space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Política de Privacidad y Protección de Datos
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: 27 de Julio de 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            1. Marco Legal (Ley 172-13 de la República Dominicana)
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            En conformidad con la <strong>Ley No. 172-13</strong> sobre la Protección de Datos de Carácter Personal en la República Dominicana, esta institución garantiza el tratamiento confidencial, seguro y transparente de la información suministrada por los titulares de los datos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            2. Recolección y Finalidad de los Datos
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Los datos personales, financieros, laborales y de identificación (Cédula de Identidad y Electoral) recolectados a través de este portal tienen la única finalidad de evaluar solicitudes de crédito, verificación de identidad, análisis de riesgo crediticio y gestión del contrato de préstamo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            3. Consulta en Sociedades de Información Crediticia (Burós)
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Al enviar su solicitud, el titular autoriza expresamente a la institución a consultar su historial crediticio en las sociedades de información crediticia (burós de crédito autorizados por la Ley 172-13) para la evaluación del riesgo crediticio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            4. Tratamiento Automatizado e Inteligencia Artificial
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Informamos que los datos suministrados son procesados mediante modelos automatizados de Inteligencia Artificial para la estimación de capacidad de pago e Scoring interno. Dichos modelos operan bajo estrictas políticas de anonimización de Información de Identificación Personal (PII) y supervisión humana (Human-in-the-Loop).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Usted conserva en todo momento el derecho de acceder a sus datos, solicitar la corrección de inconsistencias o requerir la cancelación de su tratamiento enviando una solicitud formal a nuestro departamento de cumplimiento.
          </p>
        </section>
      </div>
    </div>
  );
}

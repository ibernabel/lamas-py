import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TerminosPage() {
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
          <FileText className="h-5 w-5" />
          <span>Términos y Condiciones Legalmente Vinculantes</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 sm:p-10 shadow-sm space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Términos y Condiciones del Servicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Vigente desde: 27 de Julio de 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            1. Veracidad de la Información
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El solicitante declara bajo fe de juramento que todos los datos consignados en el formulario de solicitud son correctos, veraces y actualizados. La inclusión de datos falsos u omitidos intencionalmente dará lugar al rechazo inmediato de la solicitud sin responsabilidad para la institución.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            2. Autorización Ley 172-13
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El usuario autoriza a la entidad a verificar las referencias laborales, personales y financieras, así como a consultar su comportamiento de pago en las centrales de información crediticia (burós) registradas de conformidad con la Ley 172-13.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            3. Procesamiento mediante IA y Evaluación de Riesgo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El solicitante acepta que los algoritmos de Scoring Crediticio e Inteligencia Artificial analicen la telemetría del formulario, ingresos declarados y perfil financiero. Toda decisión de aprobación final está supeditada a la verificación documental por el equipo de analistas de crédito.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            4. Consentimiento Digital y Firma Electrónica
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El marcado de las casillas de aceptación de términos y envío del formulario constituye una firma electrónica con plena validez legal, registrándose la marca temporal y dirección IP desde la cual se realizó la solicitud.
          </p>
        </section>
      </div>
    </div>
  );
}

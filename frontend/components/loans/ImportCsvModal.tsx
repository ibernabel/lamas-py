"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { importSoliPresCSV, type ImportCSVResult } from "@/lib/api/import";

interface ImportCsvModalProps {
  onImportSuccess?: () => void;
}

export function ImportCsvModal({ onImportSuccess }: ImportCsvModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportCSVResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await importSoliPresCSV(file);
      setResult(res);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Error al procesar el archivo CSV de SoliPres.";
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
          <FileSpreadsheet className="h-4 w-4" />
          Importar Solicitudes (CSV)
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Importación de Solicitudes desde SoliPres
          </DialogTitle>
          <DialogDescription>
            Cargue el archivo CSV exportado desde SoliPres. El sistema desduplicará los clientes por cédula (NID) y registrará sus solicitudes automáticamente.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-2">
            {/* Upload Dropzone */}
            <div className="border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500 rounded-xl p-8 text-center transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {file ? file.name : "Haga clic para seleccionar o arrastre el archivo CSV de SoliPres"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Soporta codificación UTF-8 con BOM exportada de SoliPres"}
                  </p>
                </div>
              </label>
            </div>

            {errorMsg && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de Importación</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando CSV...
                  </>
                ) : (
                  "Iniciar Importación"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results view */
          <div className="space-y-4 py-2">
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="font-bold">¡Importación Completada Exitosamente!</AlertTitle>
              <AlertDescription>
                Se han procesado {result.processed_rows} registros históricos correctamente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Clientes Creados Nuevos</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{result.customers_created}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Clientes Desduplicados/Actualizados</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{result.customers_updated}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40 col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium">Solicitudes de Préstamos Registradas</p>
                  <p className="text-3xl font-bold text-primary mt-1">{result.loan_applications_created}</p>
                </CardContent>
              </Card>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="border rounded-md p-3 bg-red-50 dark:bg-red-950/20 max-h-40 overflow-y-auto">
                <p className="text-xs font-bold text-red-600 mb-2">Advertencias o Filas Omitidas ({result.errors.length}):</p>
                <ul className="text-xs space-y-1 text-red-700 dark:text-red-300">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>
                      • Fila {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Cargar Otro Archivo
              </Button>
              <Button onClick={() => setOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

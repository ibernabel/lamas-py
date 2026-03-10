"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadCustomerDocument, uploadLoanDocument } from "@/lib/api/documents";
import { toast } from "sonner";

interface DocumentUploadProps {
  entityType: "customer" | "loan";
  entityId: number;
  documentType: string;
  label: string;
  accept?: string;
  bankName?: string;
  onUploadSuccess?: (docId: number) => void;
}

export function DocumentUpload({
  entityType,
  entityId,
  documentType,
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  bankName,
  onUploadSuccess,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      if (entityType === "customer") {
        const res = await uploadCustomerDocument(entityId, documentType, file, bankName);
        onUploadSuccess?.(res.id);
      } else {
        const res = await uploadLoanDocument(entityId, documentType, file, bankName);
        onUploadSuccess?.(res.id);
      }
      setIsSuccess(true);
      setFile(null);
      toast.success(`${label} cargado correctamente`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Error al cargar ${label}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 border-dashed border-2 flex flex-col items-center justify-center space-y-3">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground w-full justify-between">
        <span>{label}</span>
        {isSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>

      {!file ? (
        <div className="flex flex-col items-center py-4 w-full">
          <label className="cursor-pointer flex flex-col items-center space-y-2 group">
            <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Click o arrastra para subir</span>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3 w-full animate-in fade-in zoom-in duration-200">
          <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-md w-full overflow-hidden">
            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs truncate font-medium">{file.name}</span>
          </div>
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => setFile(null)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-3 h-3 mr-2" />
              )}
              {isUploading ? "Subiendo..." : "Confirmar"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentList } from "./DocumentList";
import { listCustomerDocuments } from "@/lib/api/documents";
import { CustomerDocument } from "@/lib/api/types";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentsSectionProps {
  entityType: "customer" | "loan";
  entityId: number;
  requiredTypes?: Array<{ type: string; label: string; bankName?: string }>;
}

export function DocumentsSection({
  entityType,
  entityId,
  requiredTypes = [],
}: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      if (entityType === "customer") {
        const docs = await listCustomerDocuments(entityId);
        setDocuments(docs);
      } else {
        // For loans, we filters docs for that loan_id on backend mostly, 
        // but for now we list client docs and could filter 
        // (Improving backend to have listLoanDocuments would be better, but let's use customer list for now if linked)
        const docs = await listCustomerDocuments(entityId); // entityId is customerId for now, or we need to adjust
        setDocuments(docs.filter(d => d.loan_application_id === entityId || !d.loan_application_id));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gestión de Documentos</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredTypes.map((req) => (
          <DocumentUpload
            key={`${req.type}-${req.bankName || ""}`}
            entityType={entityType}
            entityId={entityId}
            documentType={req.type}
            label={req.label}
            bankName={req.bankName}
            onUploadSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Archivos Cargados</h4>
        <DocumentList 
          documents={documents} 
          onDeleteSuccess={() => setRefreshKey(prev => prev + 1)} 
        />
      </div>
    </div>
  );
}

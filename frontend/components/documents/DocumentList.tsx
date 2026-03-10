"use client";

import { useState } from "react";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CustomerDocument } from "@/lib/api/types";
import { deleteDocument } from "@/lib/api/documents";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentListProps {
  documents: CustomerDocument[];
  onDeleteSuccess?: () => void;
}

export function DocumentList({ documents, onDeleteSuccess }: DocumentListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<CustomerDocument | null>(null);

  const handleDelete = async (docId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) return;
    
    setIsDeleting(docId);
    try {
      await deleteDocument(docId);
      toast.success("Documento eliminado");
      onDeleteSuccess?.();
    } catch {
      toast.error("Error al eliminar documento");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocTypeName = (type: string) => {
    const types: Record<string, string> = {
      nid: "Cédula (NID)",
      labor_letter: "Carta de Trabajo",
      bank_statement: "Estado de Cuenta",
      credit_report: "Reporte de Crédito",
    };
    return types[type] || type;
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/10">
        <FileText className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm">No hay documentos cargados aún</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="hidden lg:table-cell">Tamaño</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className={!doc.is_latest ? "opacity-60 bg-secondary/5" : ""}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate max-w-37.5 md:max-w-50" title={doc.file_name}>
                    {doc.file_name}
                  </span>
                  {doc.is_latest && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-green-500 text-green-600 bg-green-50">
                      Actual
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs">{getDocTypeName(doc.document_type)}</span>
                  {doc.bank_name && (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {doc.bank_name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {format(new Date(doc.uploaded_at), "dd MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {formatSize(doc.file_size_bytes)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => setViewingDoc(doc)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => window.open(doc.download_url, "_blank")}
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting === doc.id}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DocumentViewerModal
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
}

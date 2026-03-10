"use client";

import { Download, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerDocument } from "@/lib/api/types";

interface DocumentViewerModalProps {
  /** Document to display; null means the modal is closed. */
  document: CustomerDocument | null;
  onClose: () => void;
}

/**
 * Inline document preview modal.
 *
 * - PDF  → `<iframe>` embedded viewer
 * - Image → `<img>` centered viewer
 * - Other → fallback with a download button
 */
export function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  const isOpen = document !== null;

  const renderContent = () => {
    if (!document) return null;

    const { content_type, download_url, file_name } = document;

    if (content_type === "application/pdf") {
      return (
        <iframe
          src={download_url}
          title={file_name}
          className="w-full rounded-md border bg-white"
          style={{ minHeight: "65vh" }}
        />
      );
    }

    if (content_type?.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={download_url}
            alt={file_name}
            className="max-w-full max-h-[65vh] rounded-md border object-contain shadow-sm"
          />
        </div>
      );
    }

    // Fallback for unsupported types (e.g. .docx, .xlsx)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[30vh] text-muted-foreground">
        <FileText className="w-16 h-16 opacity-20" />
        <p className="text-sm text-center">
          Este tipo de archivo no puede previsualizarse directamente.
        </p>
        <Button
          variant="default"
          onClick={() => window.open(download_url, "_blank")}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b bg-muted/40">
          <DialogTitle className="text-sm font-medium truncate max-w-[80%]">
            {document?.file_name ?? "Documento"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visor de documento: {document?.file_name ?? "archivo"}
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClose}
            aria-label="Cerrar visor"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}

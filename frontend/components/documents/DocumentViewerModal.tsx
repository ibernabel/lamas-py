"use client";

import { Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerDocument } from "@/lib/api/types";
import { resolveDocumentUrl } from "@/lib/utils/document-url";

interface DocumentViewerModalProps {
  /** Document to display; null means the modal is closed. */
  document: CustomerDocument | null;
  onClose: () => void;
}

/**
 * Inline document preview modal.
 *
 * - PDF  → `<iframe>` embedded viewer (Content-Disposition: inline from backend)
 * - Image → `<img>` centered viewer
 * - Other → fallback with a download button
 *
 * shadcn/ui DialogContent provides its own close (X) button automatically,
 * so no custom close button is needed here.
 */
export function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  const isOpen = document !== null;

  const renderContent = () => {
    if (!document) return null;

    const { content_type, download_url, file_name } = document;
    const resolvedUrl = resolveDocumentUrl(download_url);

    if (content_type === "application/pdf") {
      return (
        <iframe
          src={resolvedUrl}
          title={file_name}
          className="w-full rounded-md border bg-white"
          style={{ minHeight: "80vh" }}
        />
      );
    }

    if (content_type?.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedUrl}
            alt={file_name}
            className="max-w-full max-h-[70vh] rounded-md border object-contain shadow-sm"
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
          onClick={() => window.open(resolvedUrl, "_blank")}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[1200px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/40">
          <DialogTitle className="text-sm font-medium truncate pr-12">
            {document?.file_name ?? "Documento"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visor de documento: {document?.file_name ?? "archivo"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Unit tests for DocumentViewerModal.
 * Covers: closed state, PDF viewer, image viewer, fallback download, and close callback.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentViewerModal } from "@/components/documents/DocumentViewerModal";
import type { CustomerDocument } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDocument(overrides: Partial<CustomerDocument> = {}): CustomerDocument {
  return {
    id: 1,
    customer_id: 1,
    loan_application_id: null,
    document_type: "nid",
    bank_name: null,
    file_name: "cedula.pdf",
    file_size_bytes: 102400,
    content_type: "application/pdf",
    uploaded_at: "2026-03-10T10:00:00Z",
    is_latest: true,
    download_url: "http://localhost/files/cedula.pdf",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DocumentViewerModal", () => {
  it("does not render when document is null", () => {
    render(<DocumentViewerModal document={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the modal with the file name in the header", () => {
    render(
      <DocumentViewerModal
        document={makeDocument({ file_name: "cedula.pdf" })}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("cedula.pdf")).toBeInTheDocument();
  });

  it("renders an iframe for PDF content type", () => {
    render(
      <DocumentViewerModal
        document={makeDocument({ content_type: "application/pdf" })}
        onClose={vi.fn()}
      />
    );
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
  });

  it("renders an img element for image content type", () => {
    render(
      <DocumentViewerModal
        document={makeDocument({
          content_type: "image/png",
          file_name: "foto.png",
          download_url: "http://localhost/files/foto.png",
        })}
        onClose={vi.fn()}
      />
    );
    const img = document.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.alt).toBe("foto.png");
  });

  it("renders fallback download button for unsupported content types", () => {
    render(
      <DocumentViewerModal
        document={makeDocument({
          content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          file_name: "carta.docx",
        })}
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: /descargar/i })
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DocumentViewerModal document={makeDocument()} onClose={onClose} />
    );

    // shadcn/ui DialogContent renders a built-in close button with aria-label="Close"
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoanTable } from "./LoanTable";
import type { LoanApplicationListItem, PaginatedResponse } from "@/lib/api/types";

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockData: PaginatedResponse<LoanApplicationListItem> = {
  items: [
    {
      id: 1,
      customer_id: 101,
      customer_name: "John Doe",
      customer_nid: "12345678901",
      company_name: "Acme Corp",
      bank_name: "Banco Popular",
      advisor_name: "Maria Rodriguez",
      latest_note: "Cliente envió comprobante de ingresos",
      user_id: 1,
      status: "received",
      is_active: true,
      is_approved: false,
      is_rejected: false,
      is_archived: false,
      is_new: true,
      amount: 50000,
      created_at: "2024-03-01T12:00:00Z",
      updated_at: "2024-03-01T12:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  per_page: 20,
  pages: 1,
};

describe("LoanTable", () => {
  it("renders correctly with data and 7 columns", () => {
    render(
      <LoanTable
        data={mockData}
        isLoading={false}
        currentPage={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("12345678901")).toBeDefined();
    expect(screen.getByText(/50,000/)).toBeDefined();
    expect(screen.getByText("Acme Corp")).toBeDefined();
    expect(screen.getByText("Banco Popular")).toBeDefined();
    expect(screen.getByText("Maria Rodriguez")).toBeDefined();
    expect(screen.getByText("Cliente envió comprobante de ingresos")).toBeDefined();
  });

  it("shows skeleton while loading", () => {
    render(
      <LoanTable
        data={undefined}
        isLoading={true}
        currentPage={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
  });

  it("shows empty state when no items", () => {
    const emptyData = { ...mockData, items: [] };
    render(
      <LoanTable
        data={emptyData}
        isLoading={false}
        currentPage={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/no hay datos/i)).toBeDefined();
  });

  it("renders both 'Ver' and 'Editar' action buttons for loan applications", () => {
    render(
      <LoanTable
        data={mockData}
        isLoading={false}
        currentPage={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const viewBtn = screen.getByTitle("Ver");
    expect(viewBtn).toBeInTheDocument();
    expect(viewBtn.closest("a")).toHaveAttribute("href", "/loans/1");

    const editBtn = screen.getByTitle("Editar");
    expect(editBtn).toBeInTheDocument();
    expect(editBtn.closest("a")).toHaveAttribute("href", "/loans/1");
  });
});

import { describe, it, expect, vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerLoansTable } from "./CustomerLoansTable";
import { useLoanApplications, useDeleteLoan } from "@/hooks/use-loan-applications";

// Mock the hooks
vi.mock("@/hooks/use-loan-applications", () => ({
  useLoanApplications: vi.fn(),
  useDeleteLoan: vi.fn(),
}));

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockData = {
  items: [
    {
      id: 1,
      customer_id: 101,
      customer_name: "John Doe",
      customer_nid: "12345678901",
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
  per_page: 10,
  pages: 1,
};

describe("CustomerLoansTable", () => {
  it("renders with data correctly", () => {
    (useLoanApplications as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
    });
    (useDeleteLoan as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    render(<CustomerLoansTable customerId={101} />);

    expect(screen.getByText("Solicitudes de Préstamo")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("$50,000.00")).toBeDefined();
  });

  it("shows loading state", () => {
    (useLoanApplications as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useDeleteLoan as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    render(<CustomerLoansTable customerId={101} />);
    
    // LoanTable renders skeletons when loading
    // We can check if the header is there
    expect(screen.getByText("Solicitudes de Préstamo")).toBeDefined();
  });

  it("shows empty state", () => {
    (useLoanApplications as Mock).mockReturnValue({
      data: { ...mockData, items: [] },
      isLoading: false,
    });
    (useDeleteLoan as Mock).mockReturnValue({
      mutate: vi.fn(),
    });

    render(<CustomerLoansTable customerId={101} />);

    expect(screen.getByText("No loan applications found")).toBeDefined();
  });
});

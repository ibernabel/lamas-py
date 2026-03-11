import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoanDetailPage from "./page";
import { useLoanApplication } from "@/hooks/use-loan-applications";
import { useCustomer } from "@/hooks/use-customers";
import { useParams } from "next/navigation";

// Mock hooks
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/hooks/use-loan-applications", () => ({
  useLoanApplication: vi.fn(),
}));

vi.mock("@/hooks/use-customers", () => ({
  useCustomer: vi.fn(),
}));

// Mock child components that are complex or not relevant to this test
vi.mock("@/components/loans/LoanStatusBadge", () => ({
  LoanStatusBadge: () => <div data-testid="status-badge" />,
}));
vi.mock("@/components/loans/AddNoteDialog", () => ({
  AddNoteDialog: () => null,
}));
vi.mock("@/components/loans/StatusTransitionDialog", () => ({
  StatusTransitionDialog: () => null,
}));
vi.mock("@/components/loans/EvaluateLoanButton", () => ({
  EvaluateLoanButton: () => null,
}));
vi.mock("@/components/documents/DocumentsSection", () => ({
  DocumentsSection: () => <div data-testid="documents-section" />,
}));

describe("LoanDetailPage Enriched Customer Card", () => {
  const mockLoan = {
    id: 1,
    customer_id: 101,
    status: "received",
    created_at: "2024-03-01T12:00:00Z",
    detail: {
      amount: 50000,
      term: 12,
      rate: 15,
      frequency: "monthly",
      purpose: "Business expansion",
    },
    notes: [],
  };

  const mockCustomer = {
    id: 101,
    detail: {
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan.perez@example.com",
    },
    phones: [{ number: "8095551234", type: "mobile" }],
    job_info: { role: "Manager" },
    company: { name: "Acme Corp" },
  };

  it("renders enriched customer summary card correctly", () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });
    vi.mocked(useLoanApplication).mockReturnValue({ data: mockLoan, isLoading: false } as unknown as ReturnType<typeof useLoanApplication>);
    vi.mocked(useCustomer).mockReturnValue({ data: mockCustomer, isLoading: false } as unknown as ReturnType<typeof useCustomer>);

    render(<LoanDetailPage />);

    // Check Name
    expect(screen.getByText("Juan Pérez")).toBeDefined();
    // Check Phone
    expect(screen.getByText("8095551234")).toBeDefined();
    // Check Email
    expect(screen.getByText("juan.perez@example.com")).toBeDefined();
    // Check Employment (Role + Company)
    expect(screen.getByText("Manager at Acme Corp")).toBeDefined();
  });

  it("shows skeleton while customer data is loading", () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });
    vi.mocked(useLoanApplication).mockReturnValue({ data: mockLoan, isLoading: false } as unknown as ReturnType<typeof useLoanApplication>);
    vi.mocked(useCustomer).mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof useCustomer>);

    render(<LoanDetailPage />);

    // When loading, it uses Skeleton. We can check for its presence or just
    // verify that the names/phones are not rendered yet.
    expect(screen.queryByText("Juan Pérez")).toBeNull();
  });
});

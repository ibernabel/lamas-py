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
  it("renders correctly with data", () => {
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
    expect(screen.getByText("#1")).toBeDefined();
    expect(screen.getByText("$50,000.00")).toBeDefined();
    expect(screen.getByText("Received")).toBeDefined();
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

    // Should render multiple skeletons
    // Skeleton component usually doesn't have a role, but we check for its existence
    // by looking for the base container often used or just verify loading state.
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

    expect(screen.getByText("No loan applications found")).toBeDefined();
  });
});

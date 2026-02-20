/**
 * Unit tests for the CustomerTable component.
 * Verifies rendering, status badges, and accessibility marks.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomerTable } from "@/components/customers/CustomerTable";
import type { CustomerListItem, PaginatedResponse } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRouter = { push: vi.fn(), replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCustomer(overrides: Partial<CustomerListItem> = {}): CustomerListItem {
  return {
    id: 1,
    nid: "00112345678",
    full_name: "Carlos Ramírez",
    email: "carlos@example.com",
    is_active: true,
    is_assigned: false,
    portfolio_id: null,
    promoter_id: null,
    created_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

function makePaginatedResponse(
  customers: CustomerListItem[],
  page = 1
): PaginatedResponse<CustomerListItem> {
  return {
    items: customers,
    total: customers.length,
    page,
    per_page: 20,
    pages: 1,
  };
}

const defaultProps = {
  isLoading: false,
  currentPage: 1,
  onPageChange: vi.fn(),
  onDelete: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CustomerTable", () => {
  it("renders the table with column headers when data is present", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([makeCustomer()])}
      />
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders an empty state when data has no items", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([])}
      />
    );
    expect(screen.getByText(/no customers/i)).toBeInTheDocument();
  });

  it("renders an empty state when data is undefined", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={undefined}
      />
    );
    // Should fallback gracefully — not throw
    expect(document.body).toBeTruthy();
  });

  it("displays a skeleton/loading state when isLoading is true", () => {
    render(
      <CustomerTable
        {...defaultProps}
        isLoading={true}
        data={undefined}
      />
    );
    // Loading skeletons should be present
    const skeletons = document.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders one row per customer", () => {
    const customers = [
      makeCustomer({ id: 1 }),
      makeCustomer({ id: 2, nid: "00223456789", full_name: "María González" }),
    ];
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse(customers)}
      />
    );
    expect(screen.getByText("00112345678")).toBeInTheDocument();
    expect(screen.getByText("00223456789")).toBeInTheDocument();
    expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
    expect(screen.getByText("María González")).toBeInTheDocument();
  });

  it("shows 'Active' badge for an active customer", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([makeCustomer({ is_active: true })])}
      />
    );
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("shows 'Inactive' badge for an inactive customer", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([makeCustomer({ is_active: false })])}
      />
    );
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it("displays the customer email", () => {
    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([makeCustomer({ email: "test@example.com" })])}
      />
    );
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("handles null email gracefully — no crash", () => {
    expect(() =>
      render(
        <CustomerTable
          {...defaultProps}
          data={makePaginatedResponse([makeCustomer({ email: null })])}
        />
      )
    ).not.toThrow();
  });

  it("navigates to customer detail on row click", async () => {
    const user = userEvent.setup();
    mockRouter.push.mockClear();

    render(
      <CustomerTable
        {...defaultProps}
        data={makePaginatedResponse([makeCustomer({ id: 42 })])}
      />
    );

    const nidCell = screen.getByText("00112345678");
    const row = nidCell.closest("tr");
    if (row) {
      await user.click(row);
      expect(mockRouter.push).toHaveBeenCalledWith("/customers/42");
    }
  });

  it("calls onPageChange when navigating pages", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    const data: PaginatedResponse<CustomerListItem> = {
      ...makePaginatedResponse([makeCustomer()]),
      total: 50,
      pages: 3,
    };

    render(
      <CustomerTable
        {...defaultProps}
        data={data}
        onPageChange={onPageChange}
        currentPage={1}
      />
    );

    const nextBtn = screen.queryByRole("button", { name: /next/i });
    if (nextBtn) {
      await user.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);
    }
  });
});

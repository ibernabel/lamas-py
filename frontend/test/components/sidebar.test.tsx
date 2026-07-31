import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar Component", () => {
  it("renders in collapsed mode by default", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("w-14");

    // Menu text should not be rendered in DOM when collapsed
    expect(screen.queryByText(/Panel Principal|Dashboard/i)).not.toBeInTheDocument();

    // Toggle button should have expand title
    const toggleBtn = screen.getByTitle(/Expandir menú|Expand sidebar/i);
    expect(toggleBtn).toBeInTheDocument();
  });

  it("expands when toggle button is clicked", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    const toggleBtn = screen.getByTitle(/Expandir menú|Expand sidebar/i);

    fireEvent.click(toggleBtn);

    expect(aside).toHaveClass("w-64");
    expect(screen.getByText(/Panel Principal|Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Clientes|Customers/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitudes de Préstamo|Loan Applications/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Colapsar menú|Collapse sidebar/i)).toBeInTheDocument();
  });

  it("collapses back when toggle button is clicked again", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    const toggleBtn = screen.getByTitle(/Expandir menú|Expand sidebar/i);

    // Click to expand
    fireEvent.click(toggleBtn);
    expect(aside).toHaveClass("w-64");

    // Click to collapse
    const collapseBtn = screen.getByTitle(/Colapsar menú|Collapse sidebar/i);
    fireEvent.click(collapseBtn);
    expect(aside).toHaveClass("w-14");
    expect(screen.queryByText(/Panel Principal|Dashboard/i)).not.toBeInTheDocument();
  });
});

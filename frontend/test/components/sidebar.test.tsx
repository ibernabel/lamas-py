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
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();

    // Toggle button should have expand title
    const toggleBtn = screen.getByTitle("Expand sidebar");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("expands when toggle button is clicked", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    const toggleBtn = screen.getByTitle("Expand sidebar");

    fireEvent.click(toggleBtn);

    expect(aside).toHaveClass("w-64");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("Loan Applications")).toBeInTheDocument();
    expect(screen.getByTitle("Collapse sidebar")).toBeInTheDocument();
  });

  it("collapses back when toggle button is clicked again", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    const toggleBtn = screen.getByTitle("Expand sidebar");

    // Click to expand
    fireEvent.click(toggleBtn);
    expect(aside).toHaveClass("w-64");

    // Click to collapse
    const collapseBtn = screen.getByTitle("Collapse sidebar");
    fireEvent.click(collapseBtn);
    expect(aside).toHaveClass("w-14");
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});

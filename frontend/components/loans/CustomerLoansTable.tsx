"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanTable } from "./LoanTable";
import { useLoanApplications, useDeleteLoan } from "@/hooks/use-loan-applications";

interface CustomerLoansTableProps {
  customerId: number;
}

export function CustomerLoansTable({ customerId }: CustomerLoansTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLoanApplications({ 
    customer_id: customerId, 
    page,
    per_page: 10 // Smaller page size for the summary view
  });
  const { mutate: deleteLoan } = useDeleteLoan();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Solicitudes de Préstamo</CardTitle>
      </CardHeader>
      <CardContent>
        <LoanTable
          data={data}
          isLoading={isLoading}
          currentPage={page}
          onPageChange={setPage}
          onDelete={(id) => {
            if (confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
              deleteLoan(id);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

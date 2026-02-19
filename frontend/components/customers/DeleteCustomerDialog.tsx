"use client";

/**
 * DeleteCustomerDialog — confirmation dialog before soft-deleting a customer.
 * Uses shadcn/ui AlertDialog for accessibility.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCustomer } from "@/hooks/use-customers";

interface DeleteCustomerDialogProps {
  customerId: number | null;
  onClose: () => void;
}

export function DeleteCustomerDialog({
  customerId,
  onClose,
}: DeleteCustomerDialogProps) {
  const { mutate: deleteCustomer, isPending } = useDeleteCustomer();

  const handleConfirm = () => {
    if (!customerId) return;
    deleteCustomer(customerId, { onSettled: onClose });
  };

  return (
    <AlertDialog open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription>
            This action will deactivate the customer record. The data will be
            preserved for audit purposes but the customer will no longer appear
            in active lists.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

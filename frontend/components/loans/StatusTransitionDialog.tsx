"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTransitionLoanStatus } from "@/hooks/use-loan-applications";
import type { LoanStatus } from "@/lib/api/types";
import { AlertCircle } from "lucide-react";

interface StatusTransitionDialogProps {
  loanId: number;
  currentStatus: LoanStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 
 * Status transition matrix mirroring backend logic 
 */
const nextStatusMap: Record<LoanStatus, { target: LoanStatus; label: string }[]> = {
  received: [
    { target: "verified", label: "Verify Application" },
    { target: "rejected", label: "Reject Application" },
  ],
  verified: [
    { target: "assigned", label: "Assign to Analyst" },
    { target: "rejected", label: "Reject Application" },
  ],
  assigned: [
    { target: "analyzed", label: "Mark as Analyzed" },
    { target: "rejected", label: "Reject Application" },
  ],
  analyzed: [
    { target: "approved", label: "Approve Loan" },
    { target: "rejected", label: "Reject Application" },
  ],
  approved: [
    { target: "archived", label: "Archive Approved Loan" },
  ],
  rejected: [
    { target: "archived", label: "Archive Rejected Application" },
  ],
  archived: [], // No more transitions
};

export function StatusTransitionDialog({
  loanId,
  currentStatus,
  open,
  onOpenChange,
}: StatusTransitionDialogProps) {
  const [targetStatus, setTargetStatus] = useState<LoanStatus | "">("");
  const [note, setNote] = useState("");
  const transition = useTransitionLoanStatus();

  const nextOptions = nextStatusMap[currentStatus] || [];

  const handleTransition = () => {
    if (!targetStatus) return;

    transition.mutate(
      { id: loanId, status: targetStatus as LoanStatus, note: note || undefined },
      {
        onSuccess: () => {
          setTargetStatus("");
          setNote("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle>Update Loan Status</DialogTitle>
          <DialogDescription>
            Change the current workflow state of this application.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="target-status">Next Status</Label>
            {nextOptions.length > 0 ? (
              <Select
                value={targetStatus}
                onValueChange={(v) => setTargetStatus(v as LoanStatus)}
              >
                <SelectTrigger id="target-status">
                  <SelectValue placeholder="Select next step..." />
                </SelectTrigger>
                <SelectContent>
                  {nextOptions.map((opt) => (
                    <SelectItem key={opt.target} value={opt.target}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted rounded-md border border-dashed">
                <AlertCircle className="h-4 w-4" />
                This loan is in a terminal state ({currentStatus}).
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status-note">
              Reason / Note <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="status-note"
              placeholder="Provide a reason for this transition..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransition}
            disabled={!targetStatus || transition.isPending}
          >
            {transition.isPending ? "Updating..." : "Confirm Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

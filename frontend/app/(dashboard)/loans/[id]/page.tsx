"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Clock,
  Percent,
  MessageSquare,
  History,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLoanApplication } from "@/hooks/use-loan-applications";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { AddNoteDialog } from "@/components/loans/AddNoteDialog";
import { StatusTransitionDialog } from "@/components/loans/StatusTransitionDialog";
import { EvaluateLoanButton } from "@/components/loans/EvaluateLoanButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoanDetailPage() {
  const { id } = useParams();
  const loanId = parseInt(id as string);
  const router = useRouter();

  const { data: loan, isLoading } = useLoanApplication(loanId);
  const [noteOpen, setNoteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl font-bold">Loan Application Not Found</h2>
        <p className="text-muted-foreground mt-2">The application you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/loans">Back to Loans</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/loans"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Loans
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Loan Application #{loan.id}</h1>
            <LoanStatusBadge status={loan.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Registered on {new Date(loan.created_at!).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <EvaluateLoanButton loanId={loan.id} status={loan.status} />
          <Button variant="outline" onClick={() => setNoteOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Note
          </Button>
          <Button onClick={() => setStatusOpen(true)}>
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Core terms and conditions of the requested loan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Amount
                  </p>
                  <p className="text-lg font-bold">{formatCurrency(loan.detail?.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Term
                  </p>
                  <p className="text-lg font-bold">{loan.detail?.term} Months</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Percent className="h-3 w-3" /> Rate
                  </p>
                  <p className="text-lg font-bold">{loan.detail?.rate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Frequency
                  </p>
                  <p className="text-lg font-bold capitalize">{loan.detail?.frequency ?? "Monthly"}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Purpose</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {loan.detail?.purpose || "No purpose specified by customer."}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Customer Comment</h4>
                  <p className="text-sm text-muted-foreground">
                    {loan.detail?.customer_comment || "No comments provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> Timeline & Notes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {loan.notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm italic">No internal notes yet.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {loan.notes.map((note) => (
                    <div key={note.id} className="relative pl-12">
                      <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border-4 border-white shadow-sm ring-1 ring-slate-300">
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border dark:bg-slate-900/50">
                        <p className="text-sm mb-1">{note.note}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(note.created_at!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground font-medium mb-1">ID</p>
                <p className="font-mono">#{loan.customer_id}</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/customers/${loan.customer_id}`}>
                  View Full Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-100 border-slate-300 dark:bg-slate-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                Workflow State
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>Current Status: <strong className="capitalize">{loan.status}</strong></p>
              <p>Last Activity: {loan.changed_status_at ? new Date(loan.changed_status_at).toLocaleString() : "First registration"}</p>
              <Separator className="my-2" />
              <p className="text-muted-foreground leading-relaxed">
                Updating the status triggers internal validation and prepares the application for final credit decision.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddNoteDialog
        loanId={loan.id}
        open={noteOpen}
        onOpenChange={setNoteOpen}
      />
      <StatusTransitionDialog
        loanId={loan.id}
        currentStatus={loan.status}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </div>
  );
}

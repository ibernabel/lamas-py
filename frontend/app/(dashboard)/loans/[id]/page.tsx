"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Clock,
  Percent,
  MessageSquare,
  History,
  Plus,
  User,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLoanApplication, useDeleteLoan } from "@/hooks/use-loan-applications";
import { formatNid } from "@/lib/utils/format-nid";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { AddNoteDialog } from "@/components/loans/AddNoteDialog";
import { StatusTransitionDialog } from "@/components/loans/StatusTransitionDialog";
import { EvaluateLoanButton } from "@/components/loans/EvaluateLoanButton";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentsSection } from "@/components/documents/DocumentsSection";
import { useCustomer } from "@/hooks/use-customers";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function LoanDetailPage() {
  const { id } = useParams();
  const loanId = parseInt(id as string);
  const { t, language } = useTranslation();

  const { data: loan, isLoading } = useLoanApplication(loanId);
  const { data: customer, isLoading: isCustomerLoading } = useCustomer(loan?.customer_id ?? 0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <h2 className="text-xl font-bold">{t("common.noData")}</h2>
        <p className="text-muted-foreground mt-2">{t("common.notFound")}</p>
        <Button asChild className="mt-4">
          <Link href="/loans">{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat(language === "es" ? "es-DO" : "en-US", {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 2,
    }).format(val ?? 0);

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
            {t("common.back")}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{t("loans.loanDetails")} #{loan.id}</h1>
            <LoanStatusBadge status={loan.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {t("common.created")}: {new Date(loan.created_at!).toLocaleDateString(language === "es" ? "es-DO" : "en-US")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <EvaluateLoanButton loanId={loanId} />
          <Button variant="outline" onClick={() => setNoteOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {t("loans.addNote")}
          </Button>
          <Button onClick={() => setStatusOpen(true)}>
            {t("loans.changeStatus")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Loan Details Card */}
        <div className="lg:col-span-2 lg:col-start-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("loans.loanDetails")}</CardTitle>
              <CardDescription>{t("loans.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {t("loans.amount")}
                  </p>
                  <p className="text-lg font-bold">{formatCurrency(loan.detail?.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t("loans.term")}
                  </p>
                  <p className="text-lg font-bold">{loan.detail?.term} {language === "es" ? "Meses" : "Months"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Percent className="h-3 w-3" /> Tasa
                  </p>
                  <p className="text-lg font-bold">{loan.detail?.rate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {t("loans.frequency")}
                  </p>
                  <p className="text-lg font-bold capitalize">{loan.detail?.frequency ?? "—"}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">{t("loans.purpose")}</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {loan.detail?.purpose || t("common.noData")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Comentario del Cliente</h4>
                  <p className="text-sm text-muted-foreground">
                    {loan.detail?.customer_comment || t("common.noData")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details Card (Appears 2nd on small screens, right column on lg screens) */}
        <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">{t("customers.customerDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("customers.fields.fullName")}</p>
                    <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                      {isCustomerLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        `${customer?.detail?.first_name ?? t("common.noData")} ${customer?.detail?.last_name ?? ""}`
                      )}
                    </div>
                  </div>
                </div>

                {customer?.nid && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("customers.fields.nid")}</p>
                      <p className="text-sm font-semibold font-mono">{formatNid(customer.nid)}</p>
                    </div>
                  </div>
                )}

                {customer?.detail?.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("customers.fields.email")}</p>
                      <p className="text-xs font-semibold text-muted-foreground truncate max-w-[180px]">
                        {customer.detail.email}
                      </p>
                    </div>
                  </div>
                )}

                {customer?.phones && customer.phones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("customers.fields.phone")}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {customer.phones[0].number}
                      </p>
                    </div>
                  </div>
                )}

                {(customer?.job_info?.role || customer?.company?.name) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("customers.fields.companyName")}</p>
                      <p className="text-xs font-semibold text-muted-foreground truncate max-w-[180px]">
                        {customer?.job_info?.role && customer?.company?.name
                          ? `${customer.job_info.role} at ${customer.company.name}`
                          : customer?.job_info?.role || customer?.company?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {customer && (
                <Button variant="outline" size="sm" asChild className="w-full mt-4">
                  <Link href={`/customers/${customer.id}`}>
                    {t("customers.customerDetails")}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Timeline Card */}
        <div className="lg:col-span-2 lg:col-start-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> LÍnea de Tiempo y Notas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> {t("common.create")}
              </Button>
            </CardHeader>
            <CardContent>
              {loan.notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm italic">{t("common.noData")}</p>
                </div>
              ) : (
                <div className="space-y-6 relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-indigo-500 before:to-purple-500">
                  {(() => {
                    const sortedNotes = [...loan.notes].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
                    const visibleNotes = notesExpanded ? sortedNotes : sortedNotes.slice(0, 5);
                    return (
                      <>
                        {visibleNotes.map((note) => (
                          <div key={note.id} className="relative pl-12">
                            <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border-4 border-white shadow-sm ring-1 ring-slate-300">
                              <MessageSquare className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border dark:bg-slate-900/50">
                              <p className="text-sm mb-1">{note.note}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(note.created_at!).toLocaleString(language === "es" ? "es-DO" : "en-US")}
                              </p>
                            </div>
                          </div>
                        ))}
                        {sortedNotes.length > 5 && (
                          <div className="relative pl-12 pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setNotesExpanded(!notesExpanded)}
                              className="w-full text-muted-foreground text-xs hover:bg-slate-100"
                            >
                              {notesExpanded ? "Ver menos" : `Ver más (${sortedNotes.length - 5})`}
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents Section Card */}
        <div className="lg:col-span-2 lg:col-start-1">
          <Card>
            <CardHeader>
              <CardTitle>Documentos y Comprobantes</CardTitle>
              <CardDescription>Gestión de estados de cuenta y reporte de crédito de la solicitud.</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentsSection 
                entityType="loan" 
                entityId={loan.id} 
                requiredTypes={[
                  { type: "bank_statement", label: "Estado de Cuenta (Popular)", bankName: "popular" },
                  { type: "bank_statement", label: "Estado de Cuenta (BHD)", bankName: "bhd" },
                  { type: "credit_report", label: "Reporte de Crédito (TransUnion/DataCrédito)" }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddNoteDialog
        loanId={loanId}
        open={noteOpen}
        onOpenChange={setNoteOpen}
      />
      <StatusTransitionDialog
        loanId={loanId}
        currentStatus={loan.status}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </div>
  );
}

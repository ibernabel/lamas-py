"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  loanApplicationCreateSchema,
  type LoanApplicationCreateInput,
} from "@/lib/validations/loan-application.schema";
import { useCreateLoanApplication } from "@/hooks/use-loan-applications";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function LoanForm() {
  const router = useRouter();
  const createLoan = useCreateLoanApplication();

  const form = useForm<LoanApplicationCreateInput>({
    resolver: zodResolver(loanApplicationCreateSchema),
    defaultValues: {
      customer_id: undefined,
      detail: {
        amount: 50000,
        term: 12,
        rate: 2.5,
        frequency: "monthly",
        purpose: "",
        customer_comment: "",
      },
    },
  });

  const onSubmit = (data: LoanApplicationCreateInput) => {
    createLoan.mutate(data, {
      onSuccess: (loan) => {
        router.push(`/loans/${loan.id}`);
      },
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer ID Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Customer Association</h3>
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter backend Customer ID..."
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Associate this loan with an existing customer record.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Terms Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Loan Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="detail.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detail.term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term (Months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detail.rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detail.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium border-b pb-2">Additional Information</h3>
              <FormField
                control={form.control}
                name="detail.purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vehicle purchase, Debt consolidation..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detail.customer_comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes from the customer..."
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/20 dark:text-blue-400">
              <Info className="h-4 w-4 shrink-0" />
              <p>
                Once created, the loan will be in <strong>Received</strong> status. 
                You can transition it to other states from the loan detail page.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createLoan.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoan.isPending}>
                {createLoan.isPending ? "Creating..." : "Create Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

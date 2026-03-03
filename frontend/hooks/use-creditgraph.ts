/**
 * TanStack Query hooks for CreditGraph AI integration.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creditGraphApi } from "@/lib/api/creditgraph";
import { toast } from "sonner";

export const useCreditGraphAnalysis = (loanId: number) => {
  return useQuery({
    queryKey: ["creditgraph-analysis", loanId],
    queryFn: () => creditGraphApi.getAnalysis(loanId),
    enabled: !!loanId,
    retry: false, // Don't retry if analysis doesn't exist yet
  });
};

export const useTriggerCreditGraph = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, force }: { loanId: number; force?: boolean }) =>
      creditGraphApi.triggerAnalysis(loanId, force),
    onSuccess: (data, variables) => {
      // Invalidate both the analysis and the loan application (status might have changed)
      queryClient.invalidateQueries({ queryKey: ["creditgraph-analysis", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-application", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-applications"] });
      
      toast.success(data.message || "Analysis triggered successfully");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || "Failed to trigger analysis";
      toast.error(message);
    },
  });
};

export const useCreditGraphHealth = () => {
  return useQuery({
    queryKey: ["creditgraph-health"],
    queryFn: () => creditGraphApi.getHealth(),
    refetchInterval: 60000, // Check every minute
  });
};

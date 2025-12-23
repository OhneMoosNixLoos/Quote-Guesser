import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Difficulty } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Hook for fetching a quote based on difficulty
export function useQuote(difficulty: Difficulty, enabled: boolean) {
  return useQuery({
    queryKey: [api.quotes.get.path, difficulty],
    queryFn: async () => {
      const url = `${api.quotes.get.path}?difficulty=${difficulty}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch quote");
      }
      return api.quotes.get.responses[200].parse(await res.json());
    },
    enabled,
    staleTime: 0, // Always fetch a fresh quote
    refetchOnWindowFocus: false,
  });
}

// Hook for checking the answer
export function useCheckAnswer() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.quotes.check.input>) => {
      const res = await fetch(api.quotes.check.path, {
        method: api.quotes.check.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.quotes.check.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to check answer");
      }
      
      return api.quotes.check.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for resetting the score
export function useResetScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.quotes.reset.path, {
        method: api.quotes.reset.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to reset score");
      return api.quotes.reset.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Score Reset",
        description: "Your session score has been reset to 0.",
      });
    },
  });
}

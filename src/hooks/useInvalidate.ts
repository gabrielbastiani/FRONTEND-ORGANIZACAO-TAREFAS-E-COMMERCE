"use client";

import { useQueryClient } from "@tanstack/react-query";

export function useInvalidatePlanning() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["today"] }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      queryClient.invalidateQueries({ queryKey: ["review"] }),
    ]);
}
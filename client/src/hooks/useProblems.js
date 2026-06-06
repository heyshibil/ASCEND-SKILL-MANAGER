import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { problemService } from "../services/problemService";

export const useProblems = (filters) => {
  return useQuery({
    queryKey: queryKeys.problems(filters),
    queryFn: () => problemService.listProblems(filters),
    staleTime: 30_000, // 30 seconds
    placeholderData: (previousData) => previousData, // keep old data during background fetches for smooth pagination
  });
};

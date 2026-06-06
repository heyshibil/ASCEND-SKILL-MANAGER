import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { API } from "../services/api";

/**
 * Fetches the current user's problem-solving stats.
 */
const fetchProblemStats = async () => {
  const { data } = await API.get("/problems/user/stats");
  return data.stats ?? data.data?.stats ?? data.data ?? data;
};


export const useProblemStats = () => {
  return useQuery({
    queryKey: queryKeys.problemStats(), // ["problemStats"]
    queryFn: fetchProblemStats,
    staleTime: 60_000,
  });
};

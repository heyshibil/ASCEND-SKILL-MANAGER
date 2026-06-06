import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { API } from "../services/api";

/**
 * Fetches the current user's dashboard data from the server.
 * The server uses Redis caching (ttl:300, stale:60), so this rarely hits MongoDB.
 */
const fetchDashboard = async () => {
  const { data } = await API.get("/users/dashboard");
  return data.data; // unwrap { success: true, data: { ... } }
};


export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard(), // ["dashboard"]
    queryFn: fetchDashboard,
    staleTime: 60_000, // Treat data as fresh for 60s 
  });
};

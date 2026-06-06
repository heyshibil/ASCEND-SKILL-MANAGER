import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,

      // Keep the cached data in memory for 5 min after all components using it have unmounted.
      gcTime: 5 * 60 * 1000,

      // Auto-retry failed requests 
      retry: 2,

      // Silently refetch when the user returns to the browser tab after being away.
      refetchOnWindowFocus: true,
    },
  },
});

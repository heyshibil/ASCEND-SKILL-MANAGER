import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import * as notificationService from "../services/notificationService";

/**
 * Fetches all UNREAD notifications for the current user.
 * Re-fetches whenever the user returns to the browser tab.
 */
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications("unread"),
    queryFn: () => notificationService.getNotifications("unread"),
    select: (data) => data.notifications ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetches all READ notifications for the current user.
 * Less aggressive stale time — read items change slowly.
 */
export const useReadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications("read"),
    queryFn: () => notificationService.getNotifications("read"),
    select: (data) => data.notifications ?? [],
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Marks a single notification as read.
 * On success: optimistically removes it from the unread list immediately,
 * then invalidates read cache so it appears in the Read tab.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: (_data, id) => {
      // Optimistic remove from unread cache — instant UI feedback
      queryClient.setQueryData(
        queryKeys.notifications("unread"),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: (old.notifications ?? []).filter(
              (n) => n._id !== id,
            ),
          };
        },
      );
      // Invalidate read cache so the item surfaces in the Read tab
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications("read"),
      });
    },
  });
};

/**
 * Marks all unread notifications as read.
 * On success: clears the unread list and refreshes the read list.
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Clear unread cache immediately
      queryClient.setQueryData(queryKeys.notifications("unread"), (old) => {
        if (!old) return old;
        return { ...old, notifications: [] };
      });
      // Refresh read list
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications("read"),
      });
    },
  });
};

import { create } from "zustand";

/**
 * useSyncStore — lightweight store that coordinates the global "Sync" action.
 *
 * How it works:
 *  - Layouts call `startSync()` / `endSync()` to toggle the loading indicator.
 *  - `syncKey` is a monotonically-increasing counter that admin pages watch in a
 *    `useEffect([syncKey])` dependency to know when to re-fetch their local data.
 *  - React-Query caches are handled separately by each layout via `invalidateQueries`.
 */
export const useSyncStore = create((set) => ({
  isSyncing: false,
  syncKey: 0,

  startSync: () => set({ isSyncing: true }),

  endSync: () =>
    set((state) => ({
      isSyncing: false,
      syncKey: state.syncKey + 1,
    })),
}));

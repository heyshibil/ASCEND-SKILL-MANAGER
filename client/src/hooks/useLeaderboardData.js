import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { leaderboardService } from "../services/leaderboardService";

const PAGE_SIZE = 10;

const initialState = {
  entries: [],
  currentUser: null,
  hallOfFame: [],
  risingStars: [],
  page: 1,
  hasMore: false,
  loading: true,
  loadingMore: false,
  refreshing: false,
  error: null,
};

const normalizeLeaderboardPayload = (payload = {}) => ({
  entries: Array.isArray(payload.leaderboard) ? payload.leaderboard : [],
  currentUser: payload.currentUser ?? null,
  hallOfFame: Array.isArray(payload.hallOfFame) ? payload.hallOfFame : [],
  risingStars: Array.isArray(payload.risingStars) ? payload.risingStars : [],
  hasMore: Boolean(payload.hasMore),
});

const reducer = (state, action) => {
  switch (action.type) {
    case "fetchStart": {
      const isFirstPage = action.page === 1;
      const isRefresh = action.refresh;

      return {
        ...state,
        loading: isFirstPage && !isRefresh,
        loadingMore: !isFirstPage,
        refreshing: isFirstPage && isRefresh,
        error: null,
      };
    }

    case "fetchSuccess": {
      const payload = normalizeLeaderboardPayload(action.payload);
      const entries =
        action.page === 1 ? payload.entries : [...state.entries, ...payload.entries];

      return {
        ...state,
        entries,
        currentUser:
          action.page === 1 ? payload.currentUser : state.currentUser,
        hallOfFame:
          action.page === 1 ? payload.hallOfFame : state.hallOfFame,
        risingStars:
          action.page === 1 ? payload.risingStars : state.risingStars,
        page: action.page,
        hasMore: payload.hasMore,
        loading: false,
        loadingMore: false,
        refreshing: false,
        error: null,
      };
    }

    case "fetchError":
      return {
        ...state,
        loading: false,
        loadingMore: false,
        refreshing: false,
        error: action.message,
      };

    case "reset":
      return initialState;

    default:
      return state;
  }
};

export const useLeaderboardData = (mode) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortControllerRef = useRef(null);

  const fetchPage = useCallback(
    async ({ page = 1, refresh = false } = {}) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      dispatch({ type: "fetchStart", page, refresh });

      try {
        const payload = await leaderboardService.getGlobalLeaderboard({
          mode,
          page,
          limit: PAGE_SIZE,
          signal: controller.signal,
        });

        dispatch({ type: "fetchSuccess", payload, page });
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return;
        }

        dispatch({
          type: "fetchError",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to load leaderboard.",
        });
      }
    },
    [mode],
  );

  useEffect(() => {
    dispatch({ type: "reset" });
    fetchPage({ page: 1 });

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchPage]);

  const actions = useMemo(
    () => ({
      loadMore: () => {
        if (!state.hasMore || state.loadingMore || state.loading) return;
        fetchPage({ page: state.page + 1 });
      },
      refresh: () => fetchPage({ page: 1, refresh: true }),
    }),
    [fetchPage, state.hasMore, state.loading, state.loadingMore, state.page],
  );

  return {
    ...state,
    pageSize: PAGE_SIZE,
    ...actions,
  }
};

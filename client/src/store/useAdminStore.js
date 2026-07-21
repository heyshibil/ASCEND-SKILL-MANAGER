import { create } from "zustand";
import { adminService } from "../services/adminServices";

export const useAdminStore = create((set, get) => ({
  metrics: null,
  recentUsers: [],
  chartData: {
    days: null,
    week: null,
    month: null,
  },
  timeframe: "days", // 'days', 'week', 'month'

  // Loading States
  loadingBase: false,
  loadingCharts: false,
  error: null,

  setTimeframe: (tf) => {
    set({ timeframe: tf });
    // Fetch chart data - if not already cached ( for new timeframe )
    if (!get().chartData[tf]) {
      get().fetchChartData(tf);
    }
  },

  /**
   * Clears all cached chart data so that the next call to setTimeframe or
   * fetchChartData will always hit the server (used by the Sync button).
   */
  resetChartCache: () =>
    set({
      chartData: { days: null, week: null, month: null },
    }),

  fetchDashboardBase: async () => {
    set({ loadingBase: true, error: null });
    try {
      const data = await adminService.getAdminDashboard();
      set({
        metrics: data.data.metrics,
        recentUsers: data.data.recentUsers,
        loadingBase: false,
      });
    } catch (error) {
      set({ error: error.message, loadingBase: false });
    }
  },

  fetchChartData: async (period) => {
    set({ loadingCharts: true, error: null });
    try {
      const data = await adminService.getAdminDashboardCharts(period);

      set((state) => ({
        chartData: {
          ...state.chartData,
          [period]: data.data,
        },
        loadingCharts: false,
      }));
    } catch (error) {
      set({ error: error.message, loadingCharts: false });
    }
  },
}));

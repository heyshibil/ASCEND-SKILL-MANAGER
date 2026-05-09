import React, { useEffect, useState } from "react";
import axios from "axios";

const useDashboardData = () => {
  const [data, setData] = useState({
    score: 0,
    activeSkills: 0,
    skillDebts: { total: 0, critical: 0, drainingSkills: 0 },
    topSkills: [],
    problemStats: {
      totalSolved: 0,
      currentStreak: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/users/dashboard", {
          withCredentials: true,
        });

        if (isMounted && res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        if (isMounted) setError(err.response?.data?.message || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};

export default useDashboardData;

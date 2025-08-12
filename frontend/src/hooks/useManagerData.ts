import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import type { ManagerDashboardData } from "@/types/api";

export const useManagerData = () => {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getManagerDashboard();

      if (response.success) {
        setData(response.data);
      } else {
        setError("Gagal mengambil data manager");
      }
    } catch (err) {
      console.error("Error fetching manager data:", err);
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const refreshData = () => {
    fetchManagerData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
};

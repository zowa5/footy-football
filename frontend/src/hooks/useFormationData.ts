import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import type { Formation } from "@/types/api";

export const useFormationData = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getFormations();

      if (response.success) {
        setFormations(response.data);
      } else {
        setError("Gagal mengambil data formation");
      }
    } catch (err) {
      console.error("Error fetching formation data:", err);
      setError("Terjadi kesalahan saat mengambil data formation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const refreshFormations = () => {
    fetchFormations();
  };

  return {
    formations,
    loading,
    error,
    refreshFormations,
  };
};

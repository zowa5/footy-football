import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import type { User } from "@/types/api";

export const useSquadData = () => {
  const [squad, setSquad] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquad = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getSquad();

      if (response.success) {
        setSquad(response.data.squad || []);
      } else {
        setError("Gagal mengambil data squad");
      }
    } catch (err) {
      console.error("Error fetching squad data:", err);
      setError("Terjadi kesalahan saat mengambil data squad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquad();
  }, []);

  const refreshSquad = () => {
    fetchSquad();
  };

  return {
    squad,
    loading,
    error,
    refreshSquad,
  };
};

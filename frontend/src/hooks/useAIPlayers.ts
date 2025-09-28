import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface AIPlayer {
  id: string;
  username: string;
  profilePicture: string;
  bio: string;
  playerInfo: {
    firstName: string;
    lastName: string;
    position: string;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    club: string;
    // Detailed skills from schema
    offensiveAwareness: number;
    dribbling: number;
    lowPass: number;
    finishing: number;
    placeKicking: number;
    speed: number;
    kickingPower: number;
    physicalContact: number;
    stamina: number;
    ballWinning: number;
    ballControl: number;
    tightPossession: number;
    loftedPass: number;
    heading: number;
    curl: number;
    acceleration: number;
    jump: number;
    balance: number;
    defensiveAwareness: number;
    aggression: number;
    gkAwareness: number;
    gkClearing: number;
    gkReach: number;
    gkCatching: number;
    gkReflexes: number;
    weakFootUsage: number;
    weakFootAcc: number;
    form: number;
    injuryResistance: number;
    style: string;
  };
  energy: number;
  coins: number;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    tournamentsWon: number;
    skillPoints: number;
    totalEarnings: number;
  };
  overall: number;
}

interface UseAIPlayersReturn {
  aiPlayers: AIPlayer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAIPlayers = (): UseAIPlayersReturn => {
  const [aiPlayers, setAiPlayers] = useState<AIPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAIPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getAIPlayers();

      if (response.success) {
        setAiPlayers(response.data);
      } else {
        setError("Failed to load AI players");
      }
    } catch (err: any) {
      console.error("Error fetching AI players:", err);
      setError(err.message || "Failed to load AI players");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIPlayers();
  }, []);

  const refetch = () => {
    fetchAIPlayers();
  };

  return {
    aiPlayers,
    loading,
    error,
    refetch,
  };
};

import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    playerInfo: {
      position: string;
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
    };
    stats: {
      goals: number;
      assists: number;
      matches: number;
      rating: number;
    };
    level: number;
    club: string;
  };
  recentMatches: Array<{
    _id: string;
    homeTeam: { userId?: { username: string } } | string;
    awayTeam: { userId?: { username: string } } | string;
    homeScore?: number;
    awayScore?: number;
    status: string;
    scheduledDate: string;
    createdAt: string;
  }>;
  upcomingMatches: Array<{
    _id: string;
    homeTeam: { userId?: { username: string } } | string;
    awayTeam: { userId?: { username: string } } | string;
    scheduledDate: string;
    status: string;
  }>;
  stats: {
    goals: number;
    assists: number;
    matches: number;
    rating: number;
  };
}

async function fetchPlayerDashboard(): Promise<DashboardData> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch("http://localhost:5000/api/player/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch player dashboard data");
  }

  const data = await response.json();
  return data.data; // Extract the actual data from the response wrapper
}

export function usePlayerDashboard() {
  return useQuery({
    queryKey: ["playerDashboard"],
    queryFn: fetchPlayerDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// React Query Hooks for API Integration
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "../lib/api";
import type {
  LoginCredentials,
  RegisterData,
  User,
  DashboardData,
  Formation,
  StoreItem,
  Match,
  Tournament,
  LeaderboardEntry,
  PlayerInfo,
  ManagerInfo,
} from "../types/api";

// Query Keys
export const queryKeys = {
  auth: ["auth"],
  profile: ["auth", "profile"],
  playerDashboard: ["player", "dashboard"],
  playerMatches: ["player", "matches"],
  leaderboard: ["player", "leaderboard"],
  formations: ["formations"],
  storeItems: ["store", "items"],
  purchaseHistory: ["store", "purchases"],
  managerDashboard: ["manager", "dashboard"],
  squad: ["manager", "squad"],
  managerMatches: ["manager", "matches"],
  tournaments: ["tournaments"],
  users: ["admin", "users"],
  clubs: ["admin", "clubs"],
  analytics: ["admin", "analytics"],
  systemLogs: ["admin", "logs"],
  dashboardStats: ["admin", "dashboard"],
} as const;

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => apiClient.login(credentials),
    onSuccess: (data) => {
      apiClient.setToken(data.token);
      toast.success("Login berhasil!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login gagal");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterData) => apiClient.register(userData),
    onSuccess: (data) => {
      apiClient.setToken(data.token);
      toast.success("Registrasi berhasil!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registrasi gagal");
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiClient.getProfile(),
    enabled: !!localStorage.getItem("authToken"),
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      apiClient.setToken(null);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logout berhasil");
    },
  });
};

// Player Hooks
export const usePlayerDashboard = () => {
  return useQuery({
    queryKey: queryKeys.playerDashboard,
    queryFn: () => apiClient.getPlayerDashboard(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const usePlayerMatches = () => {
  return useQuery({
    queryKey: queryKeys.playerMatches,
    queryFn: () => apiClient.getPlayerMatches(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: () => apiClient.getLeaderboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useUpdatePlayerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PlayerInfo>) =>
      apiClient.updatePlayerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerDashboard });
      toast.success("Profil berhasil diperbarui!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui profil");
    },
  });
};

// Formation Hooks
export const useFormations = () => {
  return useQuery({
    queryKey: queryKeys.formations,
    queryFn: () => apiClient.getFormations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateFormation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      formationData: Omit<Formation, "_id" | "createdAt" | "updatedAt">
    ) => apiClient.createFormation(formationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.formations });
      toast.success("Formasi berhasil dibuat!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat formasi");
    },
  });
};

// Store Hooks
export const useStoreItems = () => {
  return useQuery({
    queryKey: queryKeys.storeItems,
    queryFn: () => apiClient.getStoreItems(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePurchaseHistory = () => {
  return useQuery({
    queryKey: queryKeys.purchaseHistory,
    queryFn: () => apiClient.getPurchaseHistory(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => apiClient.purchaseItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerDashboard });
      toast.success("Item berhasil dibeli!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membeli item");
    },
  });
};

// Manager Hooks
export const useManagerDashboard = () => {
  return useQuery({
    queryKey: queryKeys.managerDashboard,
    queryFn: () => apiClient.getManagerDashboard(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useSquad = () => {
  return useQuery({
    queryKey: queryKeys.squad,
    queryFn: () => apiClient.getSquad(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useManagerMatches = () => {
  return useQuery({
    queryKey: queryKeys.managerMatches,
    queryFn: () => apiClient.getManagerMatches(),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useUpdateSquad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (squadData: { players: string[]; formation: string }) =>
      apiClient.updateSquad(squadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.squad });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerDashboard });
      toast.success("Squad berhasil diperbarui!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui squad");
    },
  });
};

// Match Hooks
export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchData: Omit<Match, "_id" | "createdAt" | "updatedAt">) =>
      apiClient.createMatch(matchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playerMatches });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerMatches });
      toast.success("Match berhasil dibuat!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat match");
    },
  });
};

export const useSimulateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => apiClient.simulateMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playerMatches });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerMatches });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
      toast.success("Match simulation completed!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mensimulasikan match");
    },
  });
};

// Tournament Hooks
export const useTournaments = () => {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: () => apiClient.getTournaments(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      apiClient.joinTournament(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournaments });
      toast.success("Berhasil bergabung dengan tournament!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal bergabung dengan tournament");
    },
  });
};

// Admin Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => apiClient.getDashboardStats(),
    enabled: !!localStorage.getItem("authToken"),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useUsers = (params?: {
  role?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => apiClient.getUsers(params),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      apiClient.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("User updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
};

export const useAddCoinsToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
    }: {
      id: string;
      amount: number;
      reason?: string;
    }) => apiClient.addCoinsToUser(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("Coins added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add coins");
    },
  });
};

export const useClubs = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...queryKeys.clubs, params],
    queryFn: () => apiClient.getClubs(params),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubData: {
      clubName: string;
      username: string;
      email: string;
      password: string;
    }) => apiClient.createClub(clubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
      toast.success("Club created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create club");
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      clubData,
    }: {
      id: string;
      clubData: {
        clubName?: string;
        username?: string;
        email?: string;
        isActive?: boolean;
      };
    }) => apiClient.updateClub(id, clubData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
      toast.success("Club updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update club");
    },
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteClub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
      toast.success("Club deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete club");
    },
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
    enabled: !!localStorage.getItem("authToken"),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useSystemLogs = (params?: {
  action?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...queryKeys.systemLogs, params],
    queryFn: () => apiClient.getSystemLogs(params),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useReports = (params?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => apiClient.getReports(params),
    enabled: !!localStorage.getItem("authToken"),
  });
};

export const useMatches = (params?: {
  page?: number;
  limit?: number;
  matchday?: string;
  status?: string;
  type?: string;
  club?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "matches", params],
    queryFn: () => apiClient.getAllMatches(params),
    enabled: !!localStorage.getItem("authToken"),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useAdminTournaments = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "tournaments", params],
    queryFn: () => apiClient.getAdminTournaments(params),
    enabled: !!localStorage.getItem("authToken"),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ["admin", "tournaments", id],
    queryFn: () => apiClient.getTournament(id),
    enabled: !!id && !!localStorage.getItem("authToken"),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentData: {
      name: string;
      description?: string;
      type: string;
      maxParticipants: number;
      entryFee?: number;
      prizes?: Array<{ position: number; coins: number; title?: string }>;
      schedule: {
        registrationStart: string;
        registrationEnd: string;
        tournamentStart: string;
        tournamentEnd?: string;
      };
      status?: string;
    }) => apiClient.createTournament(tournamentData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      toast.success("Tournament berhasil dibuat!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat tournament");
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...tournamentData
    }: {
      id: string;
      name?: string;
      description?: string;
      type?: string;
      status?: string;
      maxParticipants?: number;
      entryFee?: number;
      prizes?: Array<{ position: number; coins: number; title?: string }>;
      schedule?: {
        registrationStart: string;
        registrationEnd: string;
        tournamentStart: string;
        tournamentEnd?: string;
      };
    }) => apiClient.updateTournament(id, tournamentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "tournaments", variables.id],
      });
      toast.success("Tournament berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate tournament");
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      toast.success("Tournament berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus tournament");
    },
  });
};

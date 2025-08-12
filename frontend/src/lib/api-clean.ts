// API Configuration and Base Setup
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  DashboardData,
  Formation,
  StoreItem,
  Purchase,
  Match,
  Tournament,
  LeaderboardEntry,
  ApiResponse,
  SystemLog,
  Analytics,
  DashboardStats,
  PlayerInfo,
  ManagerInfo,
} from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("authToken");
  }

  // Update token method
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/auth/profile");
  }

  // Player endpoints
  async getPlayerDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request<ApiResponse<DashboardData>>("/player/dashboard");
  }

  async getPlayerMatches(): Promise<ApiResponse<Match[]>> {
    return this.request<ApiResponse<Match[]>>("/player/matches");
  }

  async updatePlayerProfile(
    data: Partial<PlayerInfo>
  ): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/player/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Manager endpoints
  async getManagerDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request<ApiResponse<DashboardData>>("/managers/dashboard");
  }

  async getSquad(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>("/managers/squad");
  }

  async updateSquad(squadData: {
    players: string[];
    formation: string;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>("/managers/squad", {
      method: "PUT",
      body: JSON.stringify(squadData),
    });
  }

  async getManagerMatches(): Promise<ApiResponse<Match[]>> {
    return this.request<ApiResponse<Match[]>>("/managers/matches");
  }

  // Formation endpoints
  async getFormations(): Promise<ApiResponse<Formation[]>> {
    return this.request<ApiResponse<Formation[]>>("/formations");
  }

  async createFormation(
    formationData: Omit<Formation, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Formation>> {
    return this.request<ApiResponse<Formation>>("/formations", {
      method: "POST",
      body: JSON.stringify(formationData),
    });
  }

  // Store endpoints
  async getStoreItems(): Promise<ApiResponse<StoreItem[]>> {
    return this.request<ApiResponse<StoreItem[]>>("/store/items");
  }

  async purchaseItem(itemId: string): Promise<ApiResponse<Purchase>> {
    return this.request<ApiResponse<Purchase>>("/store/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    });
  }

  async getPurchaseHistory(): Promise<ApiResponse<Purchase[]>> {
    return this.request<ApiResponse<Purchase[]>>("/store/purchases");
  }

  // Match endpoints
  async createMatch(
    matchData: Omit<Match, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Match>> {
    return this.request<ApiResponse<Match>>("/matches", {
      method: "POST",
      body: JSON.stringify(matchData),
    });
  }

  async getMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.request<ApiResponse<Match>>(`/matches/${matchId}`);
  }

  async simulateMatch(matchId: string): Promise<ApiResponse<Match>> {
    return this.request<ApiResponse<Match>>(`/matches/${matchId}/simulate`, {
      method: "POST",
    });
  }

  // Tournament endpoints
  async getTournaments(): Promise<ApiResponse<Tournament[]>> {
    return this.request<ApiResponse<Tournament[]>>("/tournaments");
  }

  async joinTournament(tournamentId: string): Promise<ApiResponse<Tournament>> {
    return this.request<ApiResponse<Tournament>>(
      `/tournaments/${tournamentId}/join`,
      {
        method: "POST",
      }
    );
  }

  // Leaderboard endpoint
  async getLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.request<ApiResponse<LeaderboardEntry[]>>("/leaderboard");
  }

  // Admin endpoints (for super admin)
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<ApiResponse<DashboardStats>>("/admin/dashboard");
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>("/admin/users");
  }

  async getSystemLogs(): Promise<ApiResponse<SystemLog[]>> {
    return this.request<ApiResponse<SystemLog[]>>("/admin/logs");
  }

  async getAnalytics(): Promise<ApiResponse<Analytics>> {
    return this.request<ApiResponse<Analytics>>("/admin/analytics");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

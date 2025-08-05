// API Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: "player" | "manager" | "super_admin";
  profilePicture?: string;
  bio?: string;
  playerInfo?: PlayerInfo;
  managerInfo?: ManagerInfo;
  coins: number;
  energy: number;
  stats: UserStats;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerInfo {
  firstName: string;
  lastName: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  nationality: string;
  club: string;
  skills: PlayerSkills;
  style: string;
}

export interface Club {
  _id: string;
  clubName: string;
  clubLogo?: string;
  managerName: string;
  managerEmail: string;
  playerCount: number;
  isActive: boolean;
  createdAt: string;
  stats?: UserStats;
}

export interface ManagerInfo {
  clubName: string;
  clubLogo?: string;
  budget: number;
  reputation: number;
  experience: number;
  level: number;
}

export interface PlayerSkills {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface UserStats {
  matchesPlayed: number;
  matchesWon: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  tournamentsWon: number;
  skillPoints: number;
}

export interface Formation {
  _id: string;
  name: string;
  type: "attacking" | "balanced" | "defensive" | "wing_play";
  description: string;
  price: number;
  isDefault: boolean;
  popularity: number;
  positions: Position[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface StoreItem {
  _id: string;
  name: string;
  description: string;
  type: "skill" | "style" | "formation" | "energy" | "coins";
  category: string;
  price: number;
  effect: Record<string, number>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  _id: string;
  userId: string;
  itemId: string;
  itemType: string;
  price: number;
  purchaseDate: string;
}

export interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string;
  completedAt?: string;
  venue?: string;
  attendance?: number;
  matchData?: MatchData;
}

export interface MatchData {
  events: MatchEvent[];
  stats: MatchStats;
  formation: {
    home: string;
    away: string;
  };
}

export interface MatchEvent {
  type: "goal" | "assist" | "yellow_card" | "red_card" | "substitution";
  player: string;
  team: "home" | "away";
  minute: number;
  description?: string;
}

export interface MatchStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
}

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  type: "knockout" | "league" | "round_robin";
  status:
    | "registration_open"
    | "registration_closed"
    | "in_progress"
    | "completed"
    | "cancelled";
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizes: {
    position: number;
    coins: number;
    title?: string;
    badge?: string;
  }[];
  schedule: {
    registrationStart: string;
    registrationEnd: string;
    tournamentStart: string;
    tournamentEnd?: string;
  };
  participants: {
    id: string;
    username: string;
    teamName: string;
    joinedAt: string;
    eliminated: boolean;
    finalPosition?: number;
  }[];
  organizer?: {
    id: string;
    username: string;
    email: string;
  };
  winner?: {
    id: string;
    username: string;
  };
  matches: string[];
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: "player" | "manager";
  position?: string; // Optional for players only
  clubName?: string; // Optional for managers only
}

export interface DashboardData {
  user: User;
  recentMatches: Match[];
  upcomingMatches: Match[];
  stats: UserStats;
  leaderboard?: User[];
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  points: number;
}

export interface SystemLog {
  _id: string;
  level: "info" | "warning" | "error" | "critical";
  category:
    | "auth"
    | "user_management"
    | "tournament"
    | "match"
    | "store"
    | "system"
    | "security";
  message: string;
  details?: string;
  userId?: string;
  adminId?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    [key: string]: string | number | boolean | undefined;
  };
  createdAt: string;
  // Legacy fields for backward compatibility
  action?: string;
  timestamp?: string;
  ipAddress?: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    players: number;
    managers: number;
  };
  matches: {
    total: number;
    active: number;
    completed: number;
  };
  tournaments: {
    total: number;
    active: number;
  };
  transactions: {
    total: number;
    revenue: number;
  };
  store: {
    items: number;
    purchases: number;
  };
  recentActivity: {
    users: User[];
    matches: Match[];
  };
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalTransactions: number;
  revenue: number;
  usersByRole: Record<string, number>;
  activityTrends: {
    date: string;
    users: number;
    matches: number;
    transactions: number;
  }[];
}

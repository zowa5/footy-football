export enum UserRole {
  PLAYER = "player",
  MANAGER = "manager",
  SUPER_ADMIN = "super_admin",
}

export enum PlayerPosition {
  GK = "GK", // Goalkeeper
  CB = "CB", // Centre Back
  LB = "LB", // Left Back
  RB = "RB", // Right Back
  CDM = "CDM", // Central Defensive Midfielder
  CM = "CM", // Central Midfielder
  CAM = "CAM", // Central Attacking Midfielder
  LM = "LM", // Left Midfielder
  RM = "RM", // Right Midfielder
  LW = "LW", // Left Winger
  RW = "RW", // Right Winger
  CF = "CF", // Centre Forward
  ST = "ST", // Striker
}

export enum FormationType {
  ATTACKING = "attacking",
  BALANCED = "balanced",
  DEFENSIVE = "defensive",
  WING_PLAY = "wing_play",
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Formation {
  _id?: string;
  name: string;
  type: FormationType;
  positions: Position[];
  description?: string;
  price: number;
  isDefault: boolean;
  popularity: number;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  date: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
}

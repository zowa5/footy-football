import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole, PlayerPosition } from "../types/common";

// Player skills interface
export interface IPlayerSkills {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

// Player info interface
export interface IPlayerInfo {
  firstName: string;
  lastName: string;
  position: PlayerPosition;
  age: number;
  height: number;
  weight: number;
  nationality: string;
  club: string;
  // --- Skills ---
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
  weakFootUsage: number; // max 4
  weakFootAcc: number; // max 4
  form: number; // max 8
  injuryResistance: number; // max 3
  style: string;
}

// Manager info interface
export interface IManagerInfo {
  clubName: string;
  clubLogo?: string;
  budget: number;
  reputation: number;
  experience: number;
  level: number;
  formations?: string[]; // Array of formation IDs
}

// User stats interface
export interface IUserStats {
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
}

// Base user interface
export interface IUser extends Document {
  username?: string; // Optional untuk AI players
  email?: string; // Optional untuk AI players
  password?: string; // Optional untuk AI players
  firstName?: string; // Can be set directly or via playerInfo
  lastName?: string; // Can be set directly or via playerInfo
  role: UserRole;
  profilePicture?: string;
  bio?: string;
  playerInfo?: IPlayerInfo;
  managerInfo?: IManagerInfo;
  coins: number;
  energy: number;
  stats: IUserStats;
  isActive: boolean;
  isAI?: boolean; // Flag untuk menandai AI players
  ownedBy?: string; // Manager ID yang memiliki player ini (untuk AI players)
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Player interface (extends User)
export interface IPlayer extends IUser {
  role: UserRole.PLAYER;
  playerInfo: IPlayerInfo;
}

// Manager interface (extends User)
export interface IManager extends IUser {
  role: UserRole.MANAGER;
  managerInfo: IManagerInfo;
}

// Player skills schema
const playerSkillsSchema = new Schema<IPlayerSkills>({
  pace: { type: Number, required: true, min: 1, max: 99 },
  shooting: { type: Number, required: true, min: 1, max: 99 },
  passing: { type: Number, required: true, min: 1, max: 99 },
  dribbling: { type: Number, required: true, min: 1, max: 99 },
  defending: { type: Number, required: true, min: 1, max: 99 },
  physical: { type: Number, required: true, min: 1, max: 99 },
});

// Player info schema
const playerInfoSchema = new Schema<IPlayerInfo>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: {
    type: String,
    required: true,
    enum: [
      "GK",
      "CB",
      "LB",
      "RB",
      "CDM",
      "CM",
      "CAM",
      "LM",
      "RM",
      "LW",
      "RW",
      "ST",
    ],
  },
  age: { type: Number, required: true, min: 16, max: 45 },
  height: { type: Number, required: true, min: 150, max: 220 },
  weight: { type: Number, required: true, min: 50, max: 120 },
  nationality: { type: String, required: true },
  club: { type: String, required: true },
  offensiveAwareness: { type: Number, required: true, min: 1, max: 99 },
  dribbling: { type: Number, required: true, min: 1, max: 99 },
  lowPass: { type: Number, required: true, min: 1, max: 99 },
  finishing: { type: Number, required: true, min: 1, max: 99 },
  placeKicking: { type: Number, required: true, min: 1, max: 99 },
  speed: { type: Number, required: true, min: 1, max: 99 },
  kickingPower: { type: Number, required: true, min: 1, max: 99 },
  physicalContact: { type: Number, required: true, min: 1, max: 99 },
  stamina: { type: Number, required: true, min: 1, max: 99 },
  ballWinning: { type: Number, required: true, min: 1, max: 99 },
  ballControl: { type: Number, required: true, min: 1, max: 99 },
  tightPossession: { type: Number, required: true, min: 1, max: 99 },
  loftedPass: { type: Number, required: true, min: 1, max: 99 },
  heading: { type: Number, required: true, min: 1, max: 99 },
  curl: { type: Number, required: true, min: 1, max: 99 },
  acceleration: { type: Number, required: true, min: 1, max: 99 },
  jump: { type: Number, required: true, min: 1, max: 99 },
  balance: { type: Number, required: true, min: 1, max: 99 },
  defensiveAwareness: { type: Number, required: true, min: 1, max: 99 },
  aggression: { type: Number, required: true, min: 1, max: 99 },
  gkAwareness: { type: Number, required: true, min: 1, max: 99 },
  gkClearing: { type: Number, required: true, min: 1, max: 99 },
  gkReach: { type: Number, required: true, min: 1, max: 99 },
  gkCatching: { type: Number, required: true, min: 1, max: 99 },
  gkReflexes: { type: Number, required: true, min: 1, max: 99 },
  weakFootUsage: { type: Number, required: true, min: 1, max: 4 },
  weakFootAcc: { type: Number, required: true, min: 1, max: 4 },
  form: { type: Number, required: true, min: 1, max: 8 },
  injuryResistance: { type: Number, required: true, min: 1, max: 3 },
  style: {
    type: String,
    required: true,
    enum: ["aggressive", "technical", "balanced", "defensive", "attacking"],
  },
});

// Manager info schema
const managerInfoSchema = new Schema<IManagerInfo>({
  clubName: { type: String, required: true },
  clubLogo: { type: String, default: "" },
  budget: { type: Number, required: true, min: 0 },
  reputation: { type: Number, required: true, min: 0, max: 100 },
  experience: { type: Number, required: true, min: 0 },
  level: { type: Number, required: true, min: 1, max: 10 },
  formations: [{ type: Schema.Types.ObjectId, ref: "Formation" }], // Array of formation references
});

// User stats schema
const userStatsSchema = new Schema<IUserStats>({
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  cleanSheets: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  tournamentsWon: { type: Number, default: 0 },
  skillPoints: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
});

// Main user schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: function () {
        return !this.isAI; // Required jika bukan AI
      },
      unique: true,
      sparse: true, // Allow multiple null/undefined values
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.isAI; // Required jika bukan AI
      },
      unique: true,
      sparse: true, // Allow multiple null/undefined values
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.isAI; // Required jika bukan AI
      },
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      required: true,
      enum: [UserRole.PLAYER, UserRole.MANAGER, UserRole.SUPER_ADMIN],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    playerInfo: {
      type: playerInfoSchema,
      required: function () {
        return this.role === UserRole.PLAYER;
      },
    },
    managerInfo: {
      type: managerInfoSchema,
      required: function () {
        return this.role === UserRole.MANAGER;
      },
    },
    coins: {
      type: Number,
      default: 1000,
      min: 0,
    },
    energy: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    stats: {
      type: userStatsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    ownedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // AI players tidak punya password
  if (this.isAI || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
export const User = mongoose.model<IUser>("User", userSchema);

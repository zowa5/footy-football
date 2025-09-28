import { z } from "zod";
import { UserRole, PlayerPosition, FormationType } from "../types/common";

// Auth schemas
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum([UserRole.PLAYER, UserRole.MANAGER]),
  position: z.string().optional(), // For players
  clubName: z.string().optional(), // For managers
  playerInfo: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      position: z.string().optional(),
      age: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      nationality: z.string().optional(),
      club: z.string().optional(),
      offensiveAwareness: z.number().optional(),
      dribbling: z.number().optional(),
      lowPass: z.number().optional(),
      finishing: z.number().optional(),
      placeKicking: z.number().optional(),
      speed: z.number().optional(),
      kickingPower: z.number().optional(),
      physicalContact: z.number().optional(),
      stamina: z.number().optional(),
      ballWinning: z.number().optional(),
      ballControl: z.number().optional(),
      tightPossession: z.number().optional(),
      loftedPass: z.number().optional(),
      heading: z.number().optional(),
      curl: z.number().optional(),
      acceleration: z.number().optional(),
      jump: z.number().optional(),
      balance: z.number().optional(),
      defensiveAwareness: z.number().optional(),
      aggression: z.number().optional(),
      gkAwareness: z.number().optional(),
      gkClearing: z.number().optional(),
      gkReach: z.number().optional(),
      gkCatching: z.number().optional(),
      gkReflexes: z.number().optional(),
      weakFootUsage: z.number().optional(),
      weakFootAcc: z.number().optional(),
      form: z.number().optional(),
      injuryResistance: z.number().optional(),
      style: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Player schemas
export const createPlayerSchema = registerSchema.extend({
  role: z.literal(UserRole.PLAYER),
  position: z.enum(
    Object.values(PlayerPosition) as [PlayerPosition, ...PlayerPosition[]]
  ),
});

export const updatePlayerStatsSchema = z.object({
  pace: z.number().min(1).max(100).optional(),
  shooting: z.number().min(1).max(100).optional(),
  passing: z.number().min(1).max(100).optional(),
  dribbling: z.number().min(1).max(100).optional(),
  defending: z.number().min(1).max(100).optional(),
  physical: z.number().min(1).max(100).optional(),
});

export const updatePlayerProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  avatar: z.string().url().optional(),
  style: z.string().max(50).optional(),
});

// Manager schemas
export const createManagerSchema = registerSchema.extend({
  role: z.literal(UserRole.MANAGER),
  clubName: z
    .string()
    .min(3, "Club name must be at least 3 characters long")
    .max(50, "Club name cannot exceed 50 characters"),
});

export const updateManagerProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  clubName: z
    .string()
    .min(3, "Club name must be at least 3 characters long")
    .max(50, "Club name cannot exceed 50 characters")
    .optional(),
  clubLogo: z.string().url().optional(),
});

// Formation schemas
export const createFormationSchema = z.object({
  name: z
    .string()
    .min(3, "Formation name must be at least 3 characters long")
    .max(50, "Formation name cannot exceed 50 characters"),
  type: z.enum(
    Object.values(FormationType) as [FormationType, ...FormationType[]]
  ),
  positions: z
    .array(
      z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
      })
    )
    .length(11, "Formation must have exactly 11 positions"),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "Price cannot be negative"),
  isDefault: z.boolean().default(false),
});

export const updateFormationSchema = createFormationSchema.partial();

// Query schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default("10"),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const formationQuerySchema = paginationSchema.extend({
  type: z
    .enum(Object.values(FormationType) as [FormationType, ...FormationType[]])
    .optional(),
  search: z.string().optional(),
});

export const leaderboardQuerySchema = paginationSchema.extend({
  role: z.enum([UserRole.PLAYER, UserRole.MANAGER]).optional(),
});

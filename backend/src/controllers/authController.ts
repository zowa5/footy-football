import { Request, Response, NextFunction } from "express";
import { User, IPlayer, IManager } from "../models/User";
import { Settings } from "../models/Settings";
import { generateToken } from "../utils/jwt";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { UserRole, PlayerPosition } from "../types/common";
import { registerSchema, loginSchema } from "../utils/validation";
import mongoose from "mongoose";

/**
 * @desc    Get available clubs for player signup
 * @route   GET /api/auth/clubs
 * @access  Public
 */
export const getAvailableClubs = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Get all active managers with their club information
      const managers = await User.find({
        role: UserRole.MANAGER,
        isActive: true,
      })
        .select("managerInfo.clubName managerInfo.clubLogo username _id")
        .sort({ "managerInfo.clubName": 1 });

      // Transform to club list format
      const clubs = managers.map((manager) => ({
        _id: manager._id ? (manager._id as any).toString() : new mongoose.Types.ObjectId().toString(),
        clubName: manager.managerInfo?.clubName || "Unknown Club",
        clubLogo: manager.managerInfo?.clubLogo || "",
        managerName: manager.username,
      }));

      // Add "Free Agent" option
      clubs.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        clubName: "Free Agent",
        clubLogo: "",
        managerName: "No Manager",
      });

      res.json({
        success: true,
        data: clubs,
      });
    } catch (error: any) {
      console.error("Get clubs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch clubs",
        error: error.message,
      });
    }
  }
);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const { username, email, password, role } = validatedData;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw createError("Email is already registered", 400);
    }
    if (existingUser.username === username) {
      throw createError("Username is already taken", 400);
    }
  }

  // Create user data based on role
  let userData: any = {
    username,
    email,
    password,
    role,
  };

  if (role === UserRole.PLAYER) {
    const { position, playerInfo } = req.body;
    if (!position || !Object.values(PlayerPosition).includes(position)) {
      throw createError("Valid player position is required", 400);
    }

    // Use playerInfo from request if provided, otherwise use defaults
    const defaultPlayerInfo = {
      firstName: "Player", // Default value, can be updated later
      lastName: "User", // Default value, can be updated later
      position,
      age: 18, // Default age
      height: 175, // Default height in cm
      weight: 70, // Default weight in kg
      nationality: "Unknown", // Default, can be updated later
      club: "Free Agent", // Default
      // Default skill values for all attributes
      offensiveAwareness: 50,
      dribbling: 50,
      lowPass: 50,
      finishing: 50,
      placeKicking: 50,
      speed: 50,
      kickingPower: 50,
      physicalContact: 50,
      stamina: 50,
      ballWinning: 50,
      ballControl: 50,
      tightPossession: 50,
      loftedPass: 50,
      heading: 50,
      curl: 50,
      acceleration: 50,
      jump: 50,
      balance: 50,
      defensiveAwareness: 50,
      aggression: 50,
      gkAwareness: 50,
      gkClearing: 50,
      gkReach: 50,
      gkCatching: 50,
      gkReflexes: 50,
      weakFootUsage: 2, // Default 2/4
      weakFootAcc: 2, // Default 2/4
      form: 5, // Default 5/8
      injuryResistance: 2, // Default 2/3
      style: "balanced", // Default playing style
    };

    userData.playerInfo = playerInfo
      ? { ...defaultPlayerInfo, ...playerInfo }
      : defaultPlayerInfo;

    // Set user stats for player
    userData.stats = {
      matchesPlayed: 0,
      matchesWon: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      tournamentsWon: 0,
      skillPoints: 0,
      totalEarnings: 0,
    };

    userData.coins = 1000;
    userData.energy = 100;
  } else if (role === UserRole.MANAGER) {
    const { clubName } = req.body;
    if (!clubName || clubName.trim().length < 3) {
      throw createError(
        "Club name is required and must be at least 3 characters",
        400
      );
    }

    userData.managerInfo = {
      clubName: clubName.trim(),
      clubLogo: "", // Default empty logo
      budget: 50000,
      reputation: 50,
      experience: 0,
      level: 1,
    };

    // Set user stats for manager
    userData.stats = {
      matchesPlayed: 0,
      matchesWon: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      tournamentsWon: 0,
      skillPoints: 0,
      totalEarnings: 0,
    };

    userData.coins = 10000; // Managers start with more coins
    userData.energy = 100;
  }

  const user = await User.create(userData);

  // Generate token
  const token = generateToken({
    userId: (user._id as any).toString(),
    role: user.role,
    username: user.username,
  });

  // Remove password from response
  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("Account is deactivated", 401);
  }

  // Check maintenance mode (only allow super_admin during maintenance)
  const settings = await Settings.findOne();
  if (settings?.maintenanceMode && user.role !== "super_admin") {
    throw createError(
      "System is currently under maintenance. Please try again later.",
      503
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({
    userId: (user._id as any).toString(),
    role: user.role,
    username: user.username,
  });

  // Remove password from response
  const userResponse = user.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw createError("User not found", 404);
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

export const updateLastLogin = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw createError("User not found", 404);
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Last login updated",
  });
});

import { Request, Response, NextFunction } from "express";
import { User, IPlayer, IManager } from "../models/User";
import { Settings } from "../models/Settings";
import { generateToken } from "../utils/jwt";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { UserRole, PlayerPosition } from "../types/common";
import { registerSchema, loginSchema } from "../utils/validation";

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
    const { position } = req.body;
    if (!position || !Object.values(PlayerPosition).includes(position)) {
      throw createError("Valid player position is required", 400);
    }

    userData.playerInfo = {
      firstName: "Player", // Default value, can be updated later
      lastName: "User", // Default value, can be updated later
      position,
      age: 18, // Default age
      height: 175, // Default height in cm
      weight: 70, // Default weight in kg
      nationality: "Unknown", // Default, can be updated later
      club: "Free Agent", // Default
      skills: {
        pace: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defending: 50,
        physical: 50,
      },
      style: "balanced", // Default playing style
    };

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

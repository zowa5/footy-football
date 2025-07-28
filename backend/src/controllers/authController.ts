import { Request, Response, NextFunction } from "express";
import { User, IPlayer, IManager } from "../models/User";
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

    userData.playerData = {
      position,
      stats: {
        pace: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defending: 50,
        physical: 50,
      },
      energy: 100,
      level: 1,
      experience: 0,
      coins: 1000,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
  } else if (role === UserRole.MANAGER) {
    const { clubName } = req.body;
    if (!clubName || clubName.trim().length < 3) {
      throw createError(
        "Club name is required and must be at least 3 characters",
        400
      );
    }

    userData.managerData = {
      clubName: clubName.trim(),
      budget: 50000,
      reputation: 50,
      formations: [],
      squadSize: 0,
      matchesManaged: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
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

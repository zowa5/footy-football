import { Request, Response } from "express";
import { User } from "../models/User";
import { Match } from "../models/Match";
import { Transaction, TransactionType } from "../models/Transaction";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserRole } from "../types/common";

export const getPlayerDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    // Get recent matches for the player
    const recentMatches = await Match.find({
      $or: [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username");

    // Get upcoming matches
    const upcomingMatches = await Match.find({
      $or: [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }],
      status: { $in: ["scheduled", "in_progress"] },
    })
      .sort({ scheduledDate: 1 })
      .limit(3)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username");

    res.json({
      success: true,
      data: {
        user,
        recentMatches,
        upcomingMatches,
        stats: user.stats,
      },
    });
  }
);

export const getPlayerStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    res.json({
      success: true,
      data: {
        player: user,
      },
    });
  }
);

export const updatePlayerStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { stats } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    const userData = user as any;
    if (!userData.playerData) {
      throw createError("Player data not found", 404);
    }

    // Update stats
    if (stats) {
      Object.keys(stats).forEach((stat) => {
        if (userData.playerData.stats[stat] !== undefined) {
          userData.playerData.stats[stat] = Math.min(
            100,
            Math.max(1, stats[stat])
          );
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      message: "Player stats updated successfully",
      data: {
        player: user,
      },
    });
  }
);

export const getPlayerLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20, sortBy = "wins" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let sortField = "playerData.wins";
    switch (sortBy) {
      case "level":
        sortField = "playerData.level";
        break;
      case "experience":
        sortField = "playerData.experience";
        break;
      case "matches":
        sortField = "playerData.matchesPlayed";
        break;
      default:
        sortField = "playerData.wins";
    }

    const players = await User.find({
      role: UserRole.PLAYER,
      isActive: true,
    })
      .select(
        "username playerData.level playerData.wins playerData.losses playerData.draws playerData.matchesPlayed playerData.experience"
      )
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments({
      role: UserRole.PLAYER,
      isActive: true,
    });

    // Calculate win rate and add rank
    const leaderboard = players.map((player, index) => {
      const userData = player as any;
      const wins = userData.playerData?.wins || 0;
      const losses = userData.playerData?.losses || 0;
      const draws = userData.playerData?.draws || 0;
      const totalMatches = wins + losses + draws;
      const winRate =
        totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

      return {
        rank: skip + index + 1,
        username: player.username,
        level: userData.playerData?.level || 1,
        wins,
        losses,
        draws,
        matchesPlayed: totalMatches,
        winRate: `${winRate}%`,
        experience: userData.playerData?.experience || 0,
      };
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          current: Number(page),
          totalPages,
          total,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  }
);

export const updatePlayerEnergy = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { energy } = req.body;

    if (energy < 0 || energy > 100) {
      throw createError("Energy must be between 0 and 100", 400);
    }

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    const userData = user as any;
    if (!userData.playerData) {
      throw createError("Player data not found", 404);
    }

    userData.playerData.energy = energy;
    await user.save();

    res.json({
      success: true,
      message: "Player energy updated successfully",
      data: {
        energy: userData.playerData.energy,
      },
    });
  }
);

export const getPlayerTransactions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { userId };
    if (type) {
      filter.type = type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("metadata.storeItemId", "name icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: Number(page),
          totalPages,
          total,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  }
);

export const addPlayerExperience = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { experience, reason = "Manual adjustment" } = req.body;

    if (!experience || experience < 0) {
      throw createError("Experience must be positive", 400);
    }

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    const userData = user as any;
    if (!userData.playerData) {
      throw createError("Player data not found", 404);
    }

    const oldLevel = userData.playerData.level;
    userData.playerData.experience += experience;

    // Level up calculation (100 XP per level)
    const newLevel = Math.floor(userData.playerData.experience / 100) + 1;
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      userData.playerData.level = newLevel;

      // Level up rewards
      const coinReward = newLevel * 50;
      userData.playerData.coins += coinReward;

      // Create transaction for level reward
      const transaction = new Transaction({
        userId,
        type: TransactionType.LEVEL_REWARD,
        amount: coinReward,
        description: `Level ${newLevel} reward`,
        metadata: { level: newLevel },
      });
      await transaction.save();
    }

    await user.save();

    res.json({
      success: true,
      message: leveledUp
        ? `Level up! You are now level ${newLevel}`
        : "Experience added successfully",
      data: {
        experience: userData.playerData.experience,
        level: userData.playerData.level,
        leveledUp,
        coins: userData.playerData.coins,
      },
    });
  }
);

export const resetPlayerEnergy = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      throw createError("Player not found", 404);
    }

    const userData = user as any;
    if (!userData.playerData) {
      throw createError("Player data not found", 404);
    }

    userData.playerData.energy = 100;
    await user.save();

    res.json({
      success: true,
      message: "Player energy restored to full",
      data: {
        energy: 100,
      },
    });
  }
);

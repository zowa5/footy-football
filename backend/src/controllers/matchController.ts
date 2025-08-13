import { Request, Response } from "express";
import { Match, MatchType, MatchStatus, IMatchResult } from "../models/Match";
import { User } from "../models/User";
import { Transaction, TransactionType } from "../models/Transaction";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import mongoose from "mongoose";

export const createMatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      opponentId,
      type = MatchType.FRIENDLY,
      scheduledAt,
      homeFormation,
      awayFormation,
    } = req.body;
    const userId = req.user!.id;

    // Validate opponent
    const opponent = await User.findById(opponentId);
    if (!opponent || !opponent.isActive) {
      throw createError("Opponent not found or inactive", 404);
    }

    if ((opponent._id as any).toString() === userId) {
      throw createError("Cannot create match against yourself", 400);
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw createError("User not found", 404);
    }

    const match = new Match({
      homeTeam: {
        userId,
        formation: homeFormation,
        teamName:
          (currentUser as any).managerData?.clubName ||
          (currentUser as any).playerData?.style ||
          currentUser.username,
      },
      awayTeam: {
        userId: opponentId,
        formation: awayFormation,
        teamName:
          (opponent as any).managerData?.clubName ||
          (opponent as any).playerData?.style ||
          opponent.username,
      },
      type,
      status: MatchStatus.SCHEDULED,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    });

    await match.save();

    res.status(201).json({
      success: true,
      message: "Match created successfully",
      data: {
        match,
      },
    });
  }
);

export const getMatches = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, type, userId } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (type) {
    filter.type = type;
  }

  if (userId) {
    filter.$or = [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }];
  }

  const [matches, total] = await Promise.all([
    Match.find(filter)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username")
      .populate("homeTeam.formation", "name type")
      .populate("awayTeam.formation", "name type")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Match.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: {
      matches,
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
});

export const getMatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username")
      .populate("homeTeam.formation", "name type positions")
      .populate("awayTeam.formation", "name type positions");

    if (!match) {
      throw createError("Match not found", 404);
    }

    res.json({
      success: true,
      data: {
        match,
      },
    });
  }
);

export const startMatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await Match.findById(id);
    if (!match) {
      throw createError("Match not found", 404);
    }

    // Check if user is participant
    if (
      match.homeTeam.userId.toString() !== userId &&
      match.awayTeam.userId.toString() !== userId
    ) {
      throw createError("You are not a participant in this match", 403);
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw createError("Match cannot be started", 400);
    }

    match.status = MatchStatus.IN_PROGRESS;
    match.startedAt = new Date();

    await match.save();

    res.json({
      success: true,
      message: "Match started successfully",
      data: {
        match,
      },
    });
  }
);

export const completeMatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { result } = req.body; // { homeScore, awayScore, duration, events }
    const userId = req.user!.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const match = await Match.findById(id).session(session);
      if (!match) {
        throw createError("Match not found", 404);
      }

      // Check if user is participant
      if (
        match.homeTeam.userId.toString() !== userId &&
        match.awayTeam.userId.toString() !== userId
      ) {
        throw createError("You are not a participant in this match", 403);
      }

      if (match.status !== MatchStatus.IN_PROGRESS) {
        throw createError("Match is not in progress", 400);
      }

      // Determine winner
      let winner: "home" | "away" | "draw";
      if (result.homeScore > result.awayScore) {
        winner = "home";
      } else if (result.awayScore > result.homeScore) {
        winner = "away";
      } else {
        winner = "draw";
      }

      const matchResult: IMatchResult = {
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        winner,
        duration: result.duration || 90,
        events: result.events || [],
      };

      match.result = matchResult;
      match.status = MatchStatus.COMPLETED;
      match.completedAt = new Date();

      // Calculate rewards
      const baseCoins = match.type === MatchType.RANKED ? 200 : 100;
      const baseExperience = match.type === MatchType.RANKED ? 50 : 25;

      let homeReward = { coins: baseCoins / 2, experience: baseExperience / 2 };
      let awayReward = { coins: baseCoins / 2, experience: baseExperience / 2 };

      if (winner === "home") {
        homeReward = { coins: baseCoins, experience: baseExperience };
      } else if (winner === "away") {
        awayReward = { coins: baseCoins, experience: baseExperience };
      }

      match.rewards = { homeTeam: homeReward, awayTeam: awayReward };

      await match.save({ session });

      // Update user stats and give rewards
      await updateUserStats(
        match.homeTeam.userId,
        winner === "home" ? "win" : winner === "away" ? "loss" : "draw",
        homeReward,
        session
      );
      await updateUserStats(
        match.awayTeam.userId,
        winner === "away" ? "win" : winner === "home" ? "loss" : "draw",
        awayReward,
        session
      );

      await session.commitTransaction();

      res.json({
        success: true,
        message: "Match completed successfully",
        data: {
          match,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

// Helper function to update user stats
const updateUserStats = async (
  userId: mongoose.Types.ObjectId,
  result: "win" | "loss" | "draw",
  reward: any,
  session: any
) => {
  const user = await User.findById(userId).session(session);
  if (!user) return;

  const userData = user as any;

  // Update player stats
  if (userData.playerData) {
    userData.playerData.matchesPlayed += 1;
    userData.playerData.coins += reward.coins;
    userData.playerData.experience += reward.experience;

    if (result === "win") userData.playerData.wins += 1;
    else if (result === "loss") userData.playerData.losses += 1;
    else userData.playerData.draws += 1;

    // Level up check
    const newLevel = Math.floor(userData.playerData.experience / 100) + 1;
    if (newLevel > userData.playerData.level) {
      userData.playerData.level = newLevel;
    }
  }

  // Update manager stats
  if (userData.managerData) {
    userData.managerData.matchesManaged += 1;
    userData.managerData.budget += reward.coins;

    if (result === "win") {
      userData.managerData.wins += 1;
      userData.managerData.reputation = Math.min(
        100,
        userData.managerData.reputation + 2
      );
    } else if (result === "loss") {
      userData.managerData.losses += 1;
      userData.managerData.reputation = Math.max(
        0,
        userData.managerData.reputation - 1
      );
    } else {
      userData.managerData.draws += 1;
      userData.managerData.reputation = Math.min(
        100,
        userData.managerData.reputation + 1
      );
    }
  }

  await user.save({ session });

  // Create transaction record
  const transaction = new Transaction({
    userId,
    type: TransactionType.MATCH_REWARD,
    amount: reward.coins,
    description: `Match ${result} reward`,
    metadata: {},
  });
  await transaction.save({ session });
};

export const cancelMatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await Match.findById(id);
    if (!match) {
      throw createError("Match not found", 404);
    }

    // Check if user is participant
    if (
      match.homeTeam.userId.toString() !== userId &&
      match.awayTeam.userId.toString() !== userId
    ) {
      throw createError("You are not a participant in this match", 403);
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw createError("Only scheduled matches can be cancelled", 400);
    }

    match.status = MatchStatus.CANCELLED;
    await match.save();

    res.json({
      success: true,
      message: "Match cancelled successfully",
      data: {
        match,
      },
    });
  }
);

export const getMatchHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      result, // 'win', 'loss', 'draw'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {
      status: MatchStatus.COMPLETED,
      $or: [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }],
    };

    // Filter by result if specified
    if (result) {
      if (result === "win") {
        filter.$or = [
          { "homeTeam.userId": userId, "result.winner": "home" },
          { "awayTeam.userId": userId, "result.winner": "away" },
        ];
      } else if (result === "loss") {
        filter.$or = [
          { "homeTeam.userId": userId, "result.winner": "away" },
          { "awayTeam.userId": userId, "result.winner": "home" },
        ];
      } else if (result === "draw") {
        filter["result.winner"] = "draw";
      }
    }

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate("homeTeam.userId", "username")
        .populate("awayTeam.userId", "username")
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Match.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        matches,
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

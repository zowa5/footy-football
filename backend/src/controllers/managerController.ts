import { Request, Response } from "express";
import { User } from "../models/User";
import { Formation } from "../models/Formation";
import { Match } from "../models/Match";
import { Transaction, TransactionType } from "../models/Transaction";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserRole } from "../types/common";

export const getManagerDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId).populate(
      "managerData.formations",
      "name type popularity"
    );

    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    // Get recent matches
    const recentMatches = await Match.find({
      $or: [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username");

    // Calculate manager stats
    const userData = user as any;
    const managerData = userData.managerData || {};
    const totalMatches =
      (managerData.wins || 0) +
      (managerData.losses || 0) +
      (managerData.draws || 0);
    const winRate =
      totalMatches > 0
        ? (((managerData.wins || 0) / totalMatches) * 100).toFixed(1)
        : "0.0";

    res.json({
      success: true,
      data: {
        manager: user,
        stats: {
          totalMatches,
          winRate: `${winRate}%`,
          formationsOwned: managerData.formations?.length || 0,
        },
        recentMatches,
      },
    });
  }
);

export const getManagerFormations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId).populate("managerData.formations");

    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    const userData = user as any;
    const formations = userData.managerData?.formations || [];

    res.json({
      success: true,
      data: {
        formations,
      },
    });
  }
);

export const purchaseFormation = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { formationId } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    const formation = await Formation.findById(formationId);
    if (!formation) {
      throw createError("Formation not found", 404);
    }

    const userData = user as any;
    const managerData = userData.managerData;

    if (!managerData) {
      throw createError("Manager data not found", 404);
    }

    // Check if already owned
    if (managerData.formations.includes(formationId)) {
      throw createError("Formation already owned", 400);
    }

    // Check budget
    if (managerData.budget < formation.price) {
      throw createError("Insufficient budget", 400);
    }

    // Purchase formation
    managerData.budget -= formation.price;
    managerData.formations.push(formationId);

    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: TransactionType.STORE_PURCHASE,
      amount: -formation.price,
      description: `Purchased formation: ${formation.name}`,
      metadata: {
        storeItemId: formationId,
      },
    });
    await transaction.save();

    // Increment formation popularity
    formation.popularity += 1;
    await formation.save();

    res.json({
      success: true,
      message: "Formation purchased successfully",
      data: {
        formation,
        remainingBudget: managerData.budget,
      },
    });
  }
);

export const getManagerMatches = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {
      $or: [{ "homeTeam.userId": userId }, { "awayTeam.userId": userId }],
    };

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate("homeTeam.userId", "username")
        .populate("awayTeam.userId", "username")
        .populate("homeTeam.formation", "name type")
        .populate("awayTeam.formation", "name type")
        .sort({ createdAt: -1 })
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

export const updateClubInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { clubName, clubLogo } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    const userData = user as any;
    if (!userData.managerData) {
      throw createError("Manager data not found", 404);
    }

    if (clubName) {
      if (clubName.trim().length < 3) {
        throw createError("Club name must be at least 3 characters", 400);
      }
      userData.managerData.clubName = clubName.trim();
    }

    if (clubLogo) {
      userData.managerData.clubLogo = clubLogo;
    }

    await user.save();

    res.json({
      success: true,
      message: "Club information updated successfully",
      data: {
        manager: user,
      },
    });
  }
);

export const getManagerLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20, sortBy = "wins" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let sortField = "managerData.wins";
    switch (sortBy) {
      case "reputation":
        sortField = "managerData.reputation";
        break;
      case "budget":
        sortField = "managerData.budget";
        break;
      case "matches":
        sortField = "managerData.matchesManaged";
        break;
      default:
        sortField = "managerData.wins";
    }

    const managers = await User.find({
      role: UserRole.MANAGER,
      isActive: true,
    })
      .select("username managerData")
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments({
      role: UserRole.MANAGER,
      isActive: true,
    });

    // Calculate win rate and add rank
    const leaderboard = managers.map((manager, index) => {
      const userData = manager as any;
      const managerData = userData.managerData || {};
      const wins = managerData.wins || 0;
      const losses = managerData.losses || 0;
      const draws = managerData.draws || 0;
      const totalMatches = wins + losses + draws;
      const winRate =
        totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

      return {
        rank: skip + index + 1,
        username: manager.username,
        clubName: managerData.clubName || "Unnamed Club",
        wins,
        losses,
        draws,
        matchesManaged: totalMatches,
        winRate: `${winRate}%`,
        reputation: managerData.reputation || 50,
        budget: managerData.budget || 50000,
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

export const getManagerTransactions = asyncHandler(
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

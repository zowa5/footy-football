import { Request, Response } from "express";
import { User } from "../models/User";
import { Formation } from "../models/Formation";
import { CustomFormation } from "../models/CustomFormation";
import { Match } from "../models/Match";
import { Transaction, TransactionType } from "../models/Transaction";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserRole } from "../types/common";

export const getManagerDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId).populate(
      "managerInfo.formations",
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
    const managerInfo = userData.managerInfo || {};
    const userStats = userData.stats || {};

    // Get wins, losses, draws from user stats
    const wins = userStats.matchesWon || 0;
    const totalMatches = userStats.matchesPlayed || 0;
    const winRate =
      totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

    res.json({
      success: true,
      data: {
        manager: user,
        stats: {
          totalMatches,
          winRate: `${winRate}%`,
          formationsOwned: managerInfo.formations?.length || 0,
        },
        recentMatches,
      },
    });
  }
);

export const getManagerFormations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId).populate("managerInfo.formations");

    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    const userData = user as any;
    const formations = userData.managerInfo?.formations || [];

    // Get custom formations created by this manager
    const customFormations = await CustomFormation.find({
      createdBy: userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        formations,
        customFormations,
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
    const managerInfo = userData.managerInfo;

    if (!managerInfo) {
      throw createError("Manager info not found", 404);
    }

    // Check if already owned
    if (managerInfo.formations.includes(formationId)) {
      throw createError("Formation already owned", 400);
    }

    // Check budget
    if (managerInfo.budget < formation.price) {
      throw createError("Insufficient budget", 400);
    }

    // Purchase formation
    managerInfo.budget -= formation.price;
    managerInfo.formations.push(formationId);

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
        remainingBudget: managerInfo.budget,
      },
    });
  }
);

export const getManagerMatches = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, type } = req.query;

    // Get manager info to find their club
    const manager = await User.findById(userId).select("managerInfo");
    if (!manager || !manager.managerInfo?.clubName) {
      throw createError("Manager club not found", 404);
    }

    const managerClubName = manager.managerInfo.clubName;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {
      $or: [
        { "homeTeam.teamName": managerClubName },
        { "awayTeam.teamName": managerClubName },
      ],
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
    if (!userData.managerInfo) {
      throw createError("Manager info not found", 404);
    }

    if (clubName) {
      if (clubName.trim().length < 3) {
        throw createError("Club name must be at least 3 characters", 400);
      }
      userData.managerInfo.clubName = clubName.trim();
    }

    if (clubLogo) {
      userData.managerInfo.clubLogo = clubLogo;
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

    let sortField = "stats.matchesWon";
    switch (sortBy) {
      case "reputation":
        sortField = "managerInfo.reputation";
        break;
      case "budget":
        sortField = "managerInfo.budget";
        break;
      case "matches":
        sortField = "stats.matchesPlayed";
        break;
      default:
        sortField = "stats.matchesWon";
    }

    const managers = await User.find({
      role: UserRole.MANAGER,
      isActive: true,
    })
      .select("username managerInfo stats")
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
      const managerInfo = userData.managerInfo || {};
      const userStats = userData.stats || {};
      const wins = userStats.matchesWon || 0;
      const totalMatches = userStats.matchesPlayed || 0;
      const winRate =
        totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

      return {
        rank: skip + index + 1,
        username: manager.username,
        clubName: managerInfo.clubName || "Unnamed Club",
        wins,
        losses: 0, // Not stored separately, calculate if needed
        draws: 0, // Not stored separately, calculate if needed
        matchesManaged: totalMatches,
        winRate: `${winRate}%`,
        reputation: managerInfo.reputation || 50,
        budget: managerInfo.budget || 50000,
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

export const getSquad = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await User.findById(userId).populate("managerInfo.formations");

    if (!user || user.role !== UserRole.MANAGER) {
      throw createError("Manager not found", 404);
    }

    // Get manager's club name
    const userData = user as any;
    const managerClubName = userData.managerInfo?.clubName;

    if (!managerClubName) {
      throw createError("Manager club name not found", 400);
    }

    // Get players from the same club only
    const squad = await User.find({
      playerInfo: { $exists: true },
      "playerInfo.club": managerClubName,
      isActive: true,
    }).select("username playerInfo energy stats isActive");

    res.json({
      success: true,
      data: {
        squad,
        manager: {
          id: user._id,
          username: user.username,
          managerInfo: user.managerInfo,
        },
      },
    });
  }
);

export const getAIPlayers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get AI players that are not owned by any manager
    const aiPlayers = await User.find({
      role: "player",
      isAI: true,
      isActive: true,
      ownedBy: { $exists: false }, // Only get unowned AI players
    })
      .select("username profilePicture bio playerInfo energy coins stats")
      .lean();

    if (!aiPlayers || aiPlayers.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Format AI players data
    const formattedAIPlayers = aiPlayers.map((player) => {
      const playerInfo = player.playerInfo;
      const stats = player.stats || {};

      // Calculate overall rating based on position
      const calculateOverall = (playerInfo: any) => {
        if (!playerInfo) return 75;

        const position = playerInfo.position;
        let mainSkills = [];

        // Different calculations for different positions
        switch (position) {
          case "GK": // Goalkeeper
            mainSkills = [
              playerInfo.gkAwareness,
              playerInfo.gkReflexes,
              playerInfo.gkCatching,
              playerInfo.gkReach,
              playerInfo.gkClearing,
              playerInfo.lowPass,
            ];
            break;
          case "CB": // Centre Back
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.ballWinning,
              playerInfo.heading,
              playerInfo.physicalContact,
              playerInfo.lowPass,
              playerInfo.loftedPass,
            ];
            break;
          case "LB":
          case "RB": // Fullbacks
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.speed,
              playerInfo.stamina,
              playerInfo.lowPass,
              playerInfo.ballWinning,
              playerInfo.acceleration,
            ];
            break;
          case "CDM": // Defensive Midfielder
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.ballWinning,
              playerInfo.lowPass,
              playerInfo.stamina,
              playerInfo.physicalContact,
              playerInfo.ballControl,
            ];
            break;
          case "CM": // Central Midfielder
            mainSkills = [
              playerInfo.lowPass,
              playerInfo.ballControl,
              playerInfo.stamina,
              playerInfo.defensiveAwareness,
              playerInfo.offensiveAwareness,
              playerInfo.loftedPass,
            ];
            break;
          case "CAM": // Attacking Midfielder
            mainSkills = [
              playerInfo.offensiveAwareness,
              playerInfo.lowPass,
              playerInfo.ballControl,
              playerInfo.dribbling,
              playerInfo.finishing,
              playerInfo.curl,
            ];
            break;
          case "LM":
          case "RM": // Side Midfielders
            mainSkills = [
              playerInfo.speed,
              playerInfo.stamina,
              playerInfo.lowPass,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.offensiveAwareness,
            ];
            break;
          case "LW":
          case "RW": // Wingers
            mainSkills = [
              playerInfo.speed,
              playerInfo.dribbling,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.offensiveAwareness,
              playerInfo.finishing,
            ];
            break;
          case "ST": // Striker
            mainSkills = [
              playerInfo.finishing,
              playerInfo.offensiveAwareness,
              playerInfo.speed,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.heading,
            ];
            break;
          default:
            // Generic calculation
            mainSkills = [
              playerInfo.speed || 50,
              playerInfo.finishing || 50,
              playerInfo.lowPass || 50,
              playerInfo.dribbling || 50,
              playerInfo.defensiveAwareness || 50,
              playerInfo.physicalContact || 50,
            ];
        }

        // Filter out undefined values and calculate average
        const validSkills = mainSkills.filter(
          (skill) => skill !== undefined && skill !== null
        );
        const average =
          validSkills.length > 0
            ? validSkills.reduce((sum, skill) => sum + skill, 0) /
              validSkills.length
            : 75;

        return Math.round(average);
      };

      const overall = calculateOverall(playerInfo);

      return {
        id: player._id,
        username: player.username,
        profilePicture: player.profilePicture,
        bio: player.bio,
        playerInfo: {
          firstName: playerInfo?.firstName,
          lastName: playerInfo?.lastName,
          position: playerInfo?.position,
          age: playerInfo?.age,
          height: playerInfo?.height,
          weight: playerInfo?.weight,
          nationality: playerInfo?.nationality,
          club: playerInfo?.club,
          // Send all detailed skills
          offensiveAwareness: playerInfo?.offensiveAwareness,
          dribbling: playerInfo?.dribbling,
          lowPass: playerInfo?.lowPass,
          finishing: playerInfo?.finishing,
          placeKicking: playerInfo?.placeKicking,
          speed: playerInfo?.speed,
          kickingPower: playerInfo?.kickingPower,
          physicalContact: playerInfo?.physicalContact,
          stamina: playerInfo?.stamina,
          ballWinning: playerInfo?.ballWinning,
          ballControl: playerInfo?.ballControl,
          tightPossession: playerInfo?.tightPossession,
          loftedPass: playerInfo?.loftedPass,
          heading: playerInfo?.heading,
          curl: playerInfo?.curl,
          acceleration: playerInfo?.acceleration,
          jump: playerInfo?.jump,
          balance: playerInfo?.balance,
          defensiveAwareness: playerInfo?.defensiveAwareness,
          aggression: playerInfo?.aggression,
          gkAwareness: playerInfo?.gkAwareness,
          gkClearing: playerInfo?.gkClearing,
          gkReach: playerInfo?.gkReach,
          gkCatching: playerInfo?.gkCatching,
          gkReflexes: playerInfo?.gkReflexes,
          weakFootUsage: playerInfo?.weakFootUsage,
          weakFootAcc: playerInfo?.weakFootAcc,
          form: playerInfo?.form,
          injuryResistance: playerInfo?.injuryResistance,
          style: playerInfo?.style,
        },
        energy: player.energy,
        coins: player.coins,
        stats: {
          matchesPlayed: stats.matchesPlayed || 0,
          matchesWon: stats.matchesWon || 0,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          cleanSheets: stats.cleanSheets || 0,
          yellowCards: stats.yellowCards || 0,
          redCards: stats.redCards || 0,
          tournamentsWon: stats.tournamentsWon || 0,
          skillPoints: stats.skillPoints || 0,
          totalEarnings: stats.totalEarnings || 0,
        },
        overall,
      };
    });

    res.json({
      success: true,
      data: formattedAIPlayers,
    });
  }
);

export const buyAIPlayer = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { playerId } = req.body;
    const managerId = req.user!.id;

    // Validate input
    if (!playerId) {
      throw createError("Player ID is required", 400);
    }

    try {
      // Get manager
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== UserRole.MANAGER) {
        throw createError("Manager not found", 404);
      }

      // Get AI player
      const aiPlayer = await User.findOne({
        _id: playerId,
        role: "player",
        isAI: true,
        isActive: true,
        ownedBy: { $exists: false }, // Must be unowned
      });

      if (!aiPlayer) {
        throw createError("AI Player not found or already owned", 404);
      }

      // Calculate player price based on overall rating
      const playerInfo = aiPlayer.playerInfo;
      const calculateOverall = (playerInfo: any) => {
        if (!playerInfo) return 75;

        const position = playerInfo.position;
        let mainSkills = [];

        // Same calculation logic as in getAIPlayers
        switch (position) {
          case "GK":
            mainSkills = [
              playerInfo.gkAwareness,
              playerInfo.gkReflexes,
              playerInfo.gkCatching,
              playerInfo.gkReach,
              playerInfo.gkClearing,
              playerInfo.lowPass,
            ];
            break;
          case "CB":
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.heading,
              playerInfo.ballWinning,
              playerInfo.physicalContact,
              playerInfo.lowPass,
              playerInfo.loftedPass,
            ];
            break;
          case "LB":
          case "RB":
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.speed,
              playerInfo.stamina,
              playerInfo.lowPass,
              playerInfo.ballWinning,
              playerInfo.acceleration,
            ];
            break;
          case "CDM":
            mainSkills = [
              playerInfo.defensiveAwareness,
              playerInfo.ballWinning,
              playerInfo.lowPass,
              playerInfo.stamina,
              playerInfo.physicalContact,
              playerInfo.ballControl,
            ];
            break;
          case "CM":
            mainSkills = [
              playerInfo.lowPass,
              playerInfo.ballControl,
              playerInfo.stamina,
              playerInfo.defensiveAwareness,
              playerInfo.offensiveAwareness,
              playerInfo.loftedPass,
            ];
            break;
          case "CAM":
            mainSkills = [
              playerInfo.offensiveAwareness,
              playerInfo.ballControl,
              playerInfo.lowPass,
              playerInfo.dribbling,
              playerInfo.finishing,
              playerInfo.curl,
            ];
            break;
          case "LM":
          case "RM":
            mainSkills = [
              playerInfo.speed,
              playerInfo.stamina,
              playerInfo.lowPass,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.offensiveAwareness,
            ];
            break;
          case "LW":
          case "RW":
            mainSkills = [
              playerInfo.speed,
              playerInfo.dribbling,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.offensiveAwareness,
              playerInfo.finishing,
            ];
            break;
          case "ST":
            mainSkills = [
              playerInfo.finishing,
              playerInfo.offensiveAwareness,
              playerInfo.speed,
              playerInfo.acceleration,
              playerInfo.ballControl,
              playerInfo.heading,
            ];
            break;
          default:
            mainSkills = [
              playerInfo.speed || 50,
              playerInfo.ballControl || 50,
              playerInfo.dribbling || 50,
              playerInfo.defensiveAwareness || 50,
              playerInfo.physicalContact || 50,
            ];
        }

        const validSkills = mainSkills.filter(
          (skill) => skill !== undefined && skill !== null
        );
        const average =
          validSkills.length > 0
            ? validSkills.reduce((sum, skill) => sum + skill, 0) /
              validSkills.length
            : 75;

        return Math.round(average);
      };

      const overallRating = calculateOverall(playerInfo);

      // Calculate price based on overall rating (base price + rating multiplier)
      const basePrice = 50000; // 50k coins base
      const ratingMultiplier = 1000; // 1k per rating point
      const playerPrice = basePrice + overallRating * ratingMultiplier;

      // Check manager budget
      const managerData = manager as any;
      const managerBudget = managerData.managerInfo?.budget || 0;

      if (managerBudget < playerPrice) {
        throw createError(
          `Insufficient budget. Required: ${playerPrice.toLocaleString()} FC, Available: ${managerBudget.toLocaleString()} FC`,
          400
        );
      }

      // Deduct budget from manager
      managerData.managerInfo.budget -= playerPrice;

      // Mark AI player as owned by this manager
      (aiPlayer as any).ownedBy = managerId;

      // Save both documents
      await manager.save();
      await aiPlayer.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: managerId,
        type: TransactionType.STORE_PURCHASE,
        amount: -playerPrice,
        description: `Purchased AI Player: ${aiPlayer.username}`,
        metadata: {
          playerId: playerId,
          playerName: aiPlayer.username,
          overallRating: overallRating,
        },
      });

      await transaction.save();

      res.json({
        success: true,
        message: "AI Player purchased successfully!",
        data: {
          player: {
            id: aiPlayer._id,
            username: aiPlayer.username,
            profilePicture: aiPlayer.profilePicture,
            overall: overallRating,
          },
          price: playerPrice,
          remainingBudget: managerData.managerInfo.budget,
        },
      });
    } catch (error) {
      throw error;
    }
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

export const saveCustomFormation = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { name, positions, formationType } = req.body;

    if (!name || !positions || !Array.isArray(positions)) {
      throw createError("Invalid formation data", 400);
    }

    // Validate that all positions have players assigned
    const assignedPositions = positions.filter((pos: any) => pos.player);
    if (assignedPositions.length === 0) {
      throw createError(
        "At least one player must be assigned to formation",
        400
      );
    }

    // Check if formation name already exists for this user
    const existingFormation = await CustomFormation.findOne({
      name,
      createdBy: userId,
    });
    if (existingFormation) {
      throw createError("Formation name already exists for this user", 400);
    }

    // Create custom formation data
    const customFormationData = {
      name,
      formationType: formationType || "custom",
      positions: positions.map((pos: any) => ({
        positionId: pos.id,
        positionName: pos.name,
        playerId: pos.player?._id || null,
        playerName: pos.player
          ? `${pos.player.playerInfo?.firstName || ""} ${
              pos.player.playerInfo?.lastName || ""
            }`.trim() || pos.player.username
          : null,
        playerData: pos.player
          ? {
              _id: pos.player._id,
              username: pos.player.username,
              playerInfo: pos.player.playerInfo,
              stats: pos.player.stats,
              skills: pos.player.skills,
              overallRating: pos.player.overallRating,
            }
          : null,
        x: pos.x,
        y: pos.y,
      })),
      createdBy: userId,
      isCustom: true,
    };

    // Save to database
    const savedFormation = await CustomFormation.create(customFormationData);

    res.json({
      success: true,
      message: "Formation saved successfully",
      data: {
        formation: savedFormation,
      },
    });
  }
);

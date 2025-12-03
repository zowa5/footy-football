import { Request, Response } from "express";
import { User } from "../models/User";
import { PlayerSkill } from "../models/PlayerSkill";
import { SkillTemplate } from "../models/SkillTemplate";
import { Match } from "../models/Match";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * @desc    Get player dashboard data
 * @route   GET /api/player/dashboard
 * @access  Private
 */
export const getPlayerDashboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    // Get player with all necessary data
    const player = await User.findById(playerId)
      .select(
        "username email firstName lastName playerInfo stats level coins energy"
      )
      .lean();

    if (!player) {
      throw createError("Player not found", 404);
    }

    // Get recent matches (last 5 completed matches)
    const recentMatches = await Match.find({
      $or: [{ "homeTeam.userId": playerId }, { "awayTeam.userId": playerId }],
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username")
      .lean();

    // Get upcoming matches (next 5 scheduled matches)
    const upcomingMatches = await Match.find({
      $or: [{ "homeTeam.userId": playerId }, { "awayTeam.userId": playerId }],
      status: "scheduled",
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username")
      .lean();

    // Get player skills
    const playerSkills = await PlayerSkill.find({ playerId }).lean();

    // Prepare dashboard data
    const dashboardData = {
      user: {
        _id: player._id,
        username: player.username,
        email: player.email,
        role: player.role,
        firstName: player.playerInfo?.firstName || player.firstName || "Player",
        lastName: player.playerInfo?.lastName || player.lastName || "User",
        // Player attributes: gunakan data asli dari database
        playerInfo: player.playerInfo,
        club: player.playerInfo?.club || "Free Agent",
        coins: player.coins || 0,
        energy: player.energy || 100,
        stats: player.stats || {
          matchesPlayed: 0,
          matchesWon: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          yellowCards: 0,
          redCards: 0,
          tournamentsWon: 0,
          skillPoints: 0,
        },
        isActive: player.isActive,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
        playerSkills, // <-- tambahkan di sini
      },
      recentMatches: recentMatches.map((match) => ({
        _id: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.result?.homeScore,
        awayScore: match.result?.awayScore,
        status: match.status,
        scheduledDate: match.scheduledAt,
        completedAt: match.completedAt,
      })),
      upcomingMatches: upcomingMatches.map((match) => ({
        _id: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        scheduledDate: match.scheduledAt,
        status: match.status,
      })),
      stats: player.stats || {
        matchesPlayed: 0,
        matchesWon: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        yellowCards: 0,
        redCards: 0,
        tournamentsWon: 0,
        skillPoints: 0,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  }
);

/**
 * @desc    Get player skills
 * @route   GET /api/player/skills
 * @access  Private
 */
export const getPlayerSkills = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    // Get ALL player's skills (both active and inactive)
    const playerSkills = await PlayerSkill.find({
      playerId,
    }).sort({ acquiredAt: -1 });

    // Get available skill templates
    const skillTemplates = await SkillTemplate.find({
      isActive: true,
    }).sort({ skillType: 1, category: 1 });

    // Get player info for skill points
    const player = await User.findById(playerId).select(
      "stats.skillPoints playerInfo"
    );

    res.json({
      success: true,
      data: {
        playerSkills,
        skillTemplates,
        skillPoints: player?.stats?.skillPoints || 0,
        stylePoints: 0, // TODO: Add style points to player stats
      },
    });
  }
);

/**
 * @desc    Purchase/acquire a skill
 * @route   POST /api/player/skills/acquire
 * @access  Private
 */
export const acquireSkill = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;
    const { skillId } = req.body;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    if (!skillId) {
      throw createError("Skill ID is required", 400);
    }

    // Get skill template
    const skillTemplate = await SkillTemplate.findOne({
      skillId,
      isActive: true,
    });

    if (!skillTemplate) {
      throw createError("Skill not found", 404);
    }

    // Check if player already has this skill
    const existingSkill = await PlayerSkill.findOne({
      playerId,
      skillId,
    });

    if (existingSkill) {
      throw createError("Player already has this skill", 400);
    }

    // Get player info
    const player = await User.findById(playerId);
    if (!player) {
      throw createError("Player not found", 404);
    }

    // Check requirements
    // (Dihapus, tidak ada requirements.level di schema baru)

    // Check currency and deduct cost
    const currency = skillTemplate.currency as
      | "skillPoints"
      | "coins"
      | "stylePoints";
    if (currency === "skillPoints") {
      if ((player.stats?.skillPoints || 0) < skillTemplate.cost) {
        throw createError("Insufficient skill points", 400);
      }

      player.stats.skillPoints =
        (player.stats.skillPoints || 0) - skillTemplate.cost;
    } else if (currency === "coins") {
      if (player.coins < skillTemplate.cost) {
        throw createError("Insufficient coins", 400);
      }

      player.coins -= skillTemplate.cost;
    }

    // Create player skill
    const playerSkill = new PlayerSkill({
      playerId,
      skillId: skillTemplate.skillId,
      skillName: skillTemplate.skillName,
      skillType: skillTemplate.skillType,
      description: skillTemplate.description,
      isActive: true,
      acquiredAt: new Date(),
    });

    await playerSkill.save();
    await player.save();

    res.json({
      success: true,
      data: {
        message: "Skill acquired successfully",
        playerSkill,
        remainingSkillPoints: player.stats?.skillPoints || 0,
        remainingCoins: player.coins,
      },
    });
  }
);

/**
 * @desc    Toggle skill activation
 * @route   PUT /api/player/skills/:skillId/toggle
 * @access  Private
 */
export const toggleSkill = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;
    const { skillId } = req.params;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    const playerSkill = await PlayerSkill.findOne({
      playerId,
      skillId,
    });

    if (!playerSkill) {
      throw createError("Skill not found", 404);
    }

    playerSkill.isActive = !playerSkill.isActive;
    await playerSkill.save();

    res.json({
      success: true,
      data: {
        message: `Skill ${
          playerSkill.isActive ? "activated" : "deactivated"
        } successfully`,
        playerSkill,
      },
    });
  }
);

/**
 * @desc    Upgrade skill level
 * @route   PUT /api/player/skills/:skillId/upgrade
 * @access  Private
 */
export const upgradeSkill = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;
    const { skillId } = req.params;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    const playerSkill = await PlayerSkill.findOne({
      playerId,
      skillId,
    });

    if (!playerSkill) {
      throw createError("Skill not found", 404);
    }

    if (playerSkill.level >= playerSkill.maxLevel) {
      throw createError("Skill is already at maximum level", 400);
    }

    // Get player for currency check
    const player = await User.findById(playerId);
    if (!player) {
      throw createError("Player not found", 404);
    }

    // Calculate upgrade cost (simple formula: base cost * current level)
    const skillTemplate = await SkillTemplate.findOne({ skillId });
    const upgradeCost = skillTemplate
      ? skillTemplate.cost * playerSkill.level
      : 100;

    // Check if player can afford upgrade
    if (skillTemplate?.currency === "skillPoints") {
      if ((player.stats?.skillPoints || 0) < upgradeCost) {
        throw createError("Insufficient skill points for upgrade", 400);
      }
      player.stats.skillPoints = (player.stats.skillPoints || 0) - upgradeCost;
    } else if (skillTemplate?.currency === "stylePoints") {
      if (player.coins < upgradeCost) {
        throw createError("Insufficient coins for upgrade", 400);
      }
      player.coins -= upgradeCost;
    }

    // Upgrade skill
    playerSkill.level += 1;

    // Enhance effects based on level
    playerSkill.effects = playerSkill.effects.map((effect) => ({
      ...effect,
      value: effect.value ? effect.value + effect.value * 0.1 : effect.value,
      percentage: effect.percentage
        ? effect.percentage + effect.percentage * 0.05
        : effect.percentage,
    }));

    await playerSkill.save();
    await player.save();

    res.json({
      success: true,
      data: {
        message: "Skill upgraded successfully",
        playerSkill,
        remainingSkillPoints: player.stats?.skillPoints || 0,
        remainingCoins: player.coins,
      },
    });
  }
);

/**
 * @desc    Get player matches
 * @route   GET /api/player/matches
 * @access  Private
 */
export const getPlayerMatches = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const playerId = req.user?.id;

    if (!playerId) {
      throw createError("Player ID not found", 400);
    }

    // Get player with club info
    const player = await User.findById(playerId).select("playerInfo.club");
    if (!player || !player.playerInfo?.club) {
      throw createError("Player club not found", 404);
    }

    const playerClub = player.playerInfo.club;

    // Get recent matches (completed) for player's club
    const recentMatches = await Match.find({
      $or: [
        { "homeTeam.clubName": playerClub },
        { "awayTeam.clubName": playerClub },
      ],
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    // Get upcoming matches (scheduled) for player's club
    const upcomingMatches = await Match.find({
      $or: [
        { "homeTeam.clubName": playerClub },
        { "awayTeam.clubName": playerClub },
      ],
      status: "scheduled",
    })
      .sort({ scheduledAt: 1 })
      .limit(10)
      .lean();

    // Format matches for frontend
    const formatMatch = (match: any, isUpcoming = false) => {
      const isHome = match.homeTeam.clubName === playerClub;
      const opponent = isHome
        ? match.awayTeam.clubName
        : match.homeTeam.clubName;

      const result: any = {
        id: match._id,
        opponent: opponent,
        date: isUpcoming ? match.scheduledAt : match.completedAt,
        competition: match.competition,
        venue: match.venue,
        awayGame: !isHome,
      };

      if (!isUpcoming) {
        // Add result data for completed matches
        const homeScore = match.result?.homeScore || 0;
        const awayScore = match.result?.awayScore || 0;

        result.score = `${homeScore}-${awayScore}`;
        result.result =
          match.result?.winner === "home"
            ? isHome
              ? "WIN"
              : "LOSS"
            : match.result?.winner === "away"
            ? isHome
              ? "LOSS"
              : "WIN"
            : "DRAW";

        // Calculate GP (simplified - more GP for wins)
        result.gp =
          result.result === "WIN" ? 150 : result.result === "DRAW" ? 75 : 50;

        // Add match details
        result.details = {
          possession: Math.floor(Math.random() * 30) + 40, // 40-70%
          shots: Math.floor(Math.random() * 15) + 5, // 5-20 shots
          shotsOnTarget: Math.floor(Math.random() * 8) + 2, // 2-10 on target
          passes: Math.floor(Math.random() * 200) + 300, // 300-500 passes
          tackles: Math.floor(Math.random() * 15) + 10, // 10-25 tackles
          goals: match.events?.filter((e: any) => e.type === "goal") || [],
        };
      } else {
        // Add time for upcoming matches
        result.time = new Date(match.scheduledAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return result;
    };

    const formattedRecentMatches = recentMatches.map((match) =>
      formatMatch(match, false)
    );
    const formattedUpcomingMatches = upcomingMatches.map((match) =>
      formatMatch(match, true)
    );

    res.json({
      success: true,
      data: {
        recentMatches: formattedRecentMatches,
        upcomingMatches: formattedUpcomingMatches,
        playerClub: playerClub,
      },
    });
  }
);

/**
 * @desc    Get leaderboard data
 * @route   GET /api/player/leaderboard
 * @access  Private
 */
export const getLeaderboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get all players with their stats
    const players = await User.find({
      role: "player",
      "playerInfo.firstName": { $exists: true, $ne: null },
      "playerInfo.lastName": { $exists: true, $ne: null },
      "playerInfo.club": { $exists: true, $ne: null },
      stats: { $exists: true, $ne: null },
    })
      .select("playerInfo stats")
      .lean();

    if (!players || players.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Format leaderboard data with different categories
    const formattedPlayers = players.map((player) => {
      const playerInfo = player.playerInfo;
      const stats = player.stats || {};

      return {
        id: player._id,
        name: `${playerInfo?.firstName || "Unknown"} ${
          playerInfo?.lastName || "Player"
        }`,
        club: playerInfo?.club || "Free Agent",
        position: playerInfo?.position || "Unknown",
        // Goals
        goals: stats.goals || 0,
        // Assists
        assists: stats.assists || 0,
        // Clean sheets (for goalkeepers)
        cleanSheets: stats.cleanSheets || 0,
        // Matches won
        matchesWon: stats.matchesWon || 0,
        // Total matches played
        matchesPlayed: stats.matchesPlayed || 0,
        // Cards
        yellowCards: stats.yellowCards || 0,
        redCards: stats.redCards || 0,
      };
    });

    // Create different leaderboards
    const leaderboards = {
      goals: [...formattedPlayers]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),

      assists: [...formattedPlayers]
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),

      cleanSheets: [...formattedPlayers]
        .filter((player) => player.position === "GK") // Only goalkeepers
        .sort((a, b) => b.cleanSheets - a.cleanSheets)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),

      matchesWon: [...formattedPlayers]
        .sort((a, b) => b.matchesWon - a.matchesWon)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),

      yellowCards: [...formattedPlayers]
        .sort((a, b) => b.yellowCards - a.yellowCards)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),

      redCards: [...formattedPlayers]
        .sort((a, b) => b.redCards - a.redCards)
        .slice(0, 10)
        .map((player, index) => ({ ...player, rank: index + 1 })),
    };

    res.json({
      success: true,
      data: leaderboards,
    });
  }
);

/**
 * @desc    Get all players (for browsing by managers)
 * @route   GET /api/players
 * @access  Private
 */
export const getAllPlayers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Disable caching for this response
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Get all players (users with role = 'player')
    const players = await User.find({ role: "player" })
      .select(
        "username email playerInfo coins createdAt updatedAt stats isActive"
      )
      .lean();

    // Format players data
    const formattedPlayers = (players || []).map((player) => ({
      _id: player._id,
      username: player.username,
      email: player.email,
      playerInfo: {
        firstName: player.playerInfo?.firstName || "Player",
        lastName: player.playerInfo?.lastName || "User",
        position: player.playerInfo?.position || "Unknown",
        club: player.playerInfo?.club || "Free Agent",
        age: player.playerInfo?.age || null,
        height: player.playerInfo?.height || null,
        weight: player.playerInfo?.weight || null,
        nationality: player.playerInfo?.nationality || "Unknown",
        style: player.playerInfo?.style || "balanced",
      },
      coins: player.coins || 0,
      stats: player.stats || {
        matchesPlayed: 0,
        matchesWon: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        yellowCards: 0,
        redCards: 0,
        tournamentsWon: 0,
      },
      isActive: player.isActive,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        players: formattedPlayers,
        total: formattedPlayers.length,
      },
    });
  }
);


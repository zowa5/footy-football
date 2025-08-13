import { Request, Response } from "express";
import { Tournament, TournamentStatus } from "../models/Tournament";
import { User } from "../models/User";
import { Match } from "../models/Match";
import { Transaction } from "../models/Transaction";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../types/common";
import mongoose from "mongoose";

/**
 * @desc    Create new tournament
 * @route   POST /api/tournaments
 * @access  Private (Manager/Admin)
 */
export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      maxParticipants,
      entryFee,
      prizePool,
      startDate,
      endDate,
    } = req.body;

    // Check if user is manager or admin
    if (
      !req.user ||
      ![UserRole.MANAGER, UserRole.SUPER_ADMIN].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. Manager or Admin role required." });
    }

    // Create tournament
    const tournament = new Tournament({
      name,
      description,
      creator: new mongoose.Types.ObjectId(req.user.id),
      maxParticipants,
      entryFee,
      prizePool,
      startDate,
      endDate,
    });

    await tournament.save();

    // Populate creator info
    await tournament.populate("creator", "username email");

    res.status(201).json({
      message: "Tournament created successfully",
      tournament,
    });
  } catch (error: any) {
    console.error("Create tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all tournaments
 * @route   GET /api/tournaments
 * @access  Public
 */
export const getTournaments = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tournaments = await Tournament.find(query)
      .populate("creator", "username")
      .populate("participants", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Get tournaments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get tournament by ID
 * @route   GET /api/tournaments/:id
 * @access  Public
 */
export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("creator", "username email")
      .populate("participants", "username profilePicture stats")
      .populate("winner", "username");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Get tournament matches
    const matches = await Match.find({ tournament: tournament._id })
      .populate("player1", "username")
      .populate("player2", "username")
      .sort({ createdAt: -1 });

    res.json({
      tournament,
      matches,
    });
  } catch (error: any) {
    console.error("Get tournament by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Join tournament
 * @route   POST /api/tournaments/:id/join
 * @access  Private
 */
export const joinTournament = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      return res
        .status(400)
        .json({ message: "Tournament is not accepting participants" });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: "Tournament is full" });
    }

    // Check if user already joined
    if (tournament.participants.some((p) => p.toString() === req.user!.id)) {
      return res
        .status(400)
        .json({ message: "You have already joined this tournament" });
    }

    // Check if user has enough balance for entry fee
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.coins < tournament.entryFee) {
      return res
        .status(400)
        .json({ message: "Insufficient coins for entry fee" });
    }

    // Deduct entry fee
    user.coins -= tournament.entryFee;
    await user.save();

    // Add user to tournament
    tournament.participants.push({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      teamName: user.managerInfo?.clubName || "Unknown Team",
      joinedAt: new Date()
    });
    await tournament.save();

    // Create transaction record
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(req.user!.id),
      type: "tournament_entry",
      amount: tournament.entryFee,
      description: `Entry fee for tournament: ${tournament.name}`,
      relatedModel: "Tournament",
      relatedId: tournament._id,
    });
    await transaction.save();

    res.json({
      message: "Successfully joined tournament",
      tournament: await tournament.populate("participants", "username"),
    });
  } catch (error: any) {
    console.error("Join tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Leave tournament
 * @route   POST /api/tournaments/:id/leave
 * @access  Private
 */
export const leaveTournament = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      return res
        .status(400)
        .json({ message: "Cannot leave tournament after it has started" });
    }

    // Check if user is in tournament
    if (!tournament.participants.some((p) => p.toString() === req.user!.id)) {
      return res
        .status(400)
        .json({ message: "You are not in this tournament" });
    }

    // Remove user from tournament
    tournament.participants = tournament.participants.filter(
      (participant) => participant.toString() !== req.user!.id
    );
    await tournament.save();

    // Refund entry fee
    const user = await User.findById(req.user!.id);
    if (user) {
      user.coins += tournament.entryFee;
      await user.save();

      // Create refund transaction
      const transaction = new Transaction({
        user: new mongoose.Types.ObjectId(req.user!.id),
        type: "refund",
        amount: tournament.entryFee,
        description: `Refund for leaving tournament: ${tournament.name}`,
        relatedModel: "Tournament",
        relatedId: tournament._id,
      });
      await transaction.save();
    }

    res.json({
      message: "Successfully left tournament",
      tournament: await tournament.populate("participants", "username"),
    });
  } catch (error: any) {
    console.error("Leave tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Start tournament
 * @route   PUT /api/tournaments/:id/start
 * @access  Private (Creator/Admin)
 */
export const startTournament = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check permissions
    if (
      tournament.creator.toString() !== req.user!.id &&
      req.user!.role !== UserRole.SUPER_ADMIN
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      return res.status(400).json({ message: "Tournament cannot be started" });
    }

    if (tournament.participants.length < 2) {
      return res
        .status(400)
        .json({ message: "Minimum 2 participants required" });
    }

    // Start tournament
    tournament.status = TournamentStatus.ACTIVE;
    tournament.actualStartDate = new Date();
    await tournament.save();

    // Generate first round matches
    await generateTournamentMatches((tournament._id as mongoose.Types.ObjectId).toString());

    res.json({
      message: "Tournament started successfully",
      tournament,
    });
  } catch (error: any) {
    console.error("Start tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Complete tournament
 * @route   PUT /api/tournaments/:id/complete
 * @access  Private (Creator/Admin)
 */
export const completeTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { winnerId } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check permissions
    if (
      tournament.creator.toString() !== req.user!.id &&
      req.user!.role !== UserRole.SUPER_ADMIN
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (tournament.status !== TournamentStatus.ACTIVE) {
      return res.status(400).json({ message: "Tournament is not active" });
    }

    // Verify winner is in tournament
    if (!tournament.participants.some((p) => p.toString() === winnerId)) {
      return res
        .status(400)
        .json({ message: "Winner must be a tournament participant" });
    }

    // Complete tournament
    tournament.status = TournamentStatus.COMPLETED;
    tournament.winner = winnerId;
    tournament.actualEndDate = new Date();
    await tournament.save();

    // Award prize to winner
    const winner = await User.findById(winnerId);
    if (winner) {
      winner.coins += tournament.prizePool;
      winner.stats.tournamentsWon += 1;
      await winner.save();

      // Create prize transaction
      const transaction = new Transaction({
        user: new mongoose.Types.ObjectId(winnerId),
        type: "tournament_prize",
        amount: tournament.prizePool,
        description: `Prize for winning tournament: ${tournament.name}`,
        relatedModel: "Tournament",
        relatedId: tournament._id,
      });
      await transaction.save();
    }

    res.json({
      message: "Tournament completed successfully",
      tournament: await tournament.populate("winner", "username"),
    });
  } catch (error: any) {
    console.error("Complete tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Cancel tournament
 * @route   PUT /api/tournaments/:id/cancel
 * @access  Private (Creator/Admin)
 */
export const cancelTournament = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check permissions
    if (
      tournament.creator.toString() !== req.user!.id &&
      req.user!.role !== UserRole.SUPER_ADMIN
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      tournament.status === TournamentStatus.COMPLETED ||
      tournament.status === TournamentStatus.CANCELLED
    ) {
      return res
        .status(400)
        .json({ message: "Tournament cannot be cancelled" });
    }

    // Cancel tournament
    tournament.status = TournamentStatus.CANCELLED;
    await tournament.save();

    // Refund all participants
    for (const participantId of tournament.participants) {
      const participant = await User.findById(participantId);
      if (participant) {
        participant.coins += tournament.entryFee;
        await participant.save();

        // Create refund transaction
        const transaction = new Transaction({
          user: participantId,
          type: "refund",
          amount: tournament.entryFee,
          description: `Refund for cancelled tournament: ${tournament.name}`,
          relatedModel: "Tournament",
          relatedId: tournament._id,
        });
        await transaction.save();
      }
    }

    res.json({
      message: "Tournament cancelled successfully",
      tournament,
    });
  } catch (error: any) {
    console.error("Cancel tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get user's tournament history
 * @route   GET /api/tournaments/my-tournaments
 * @access  Private
 */
export const getUserTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {
      $or: [
        { creator: new mongoose.Types.ObjectId(req.user!.id) },
        { participants: new mongoose.Types.ObjectId(req.user!.id) },
      ],
    };

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tournaments = await Tournament.find(query)
      .populate("creator", "username")
      .populate("winner", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Get user tournaments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to generate tournament matches
const generateTournamentMatches = async (tournamentId: string) => {
  try {
    const tournament = await Tournament.findById(tournamentId).populate(
      "participants"
    );
    if (!tournament) return;

    const participants = tournament.participants;
    const matches = [];

    // Simple round-robin or elimination bracket generation
    // For now, let's create matches between all participants
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match = new Match({
          player1: participants[i],
          player2: participants[j],
          tournament: tournamentId,
        });
        matches.push(match);
      }
    }

    await Match.insertMany(matches);
  } catch (error) {
    console.error("Generate tournament matches error:", error);
    throw error;
  }
};

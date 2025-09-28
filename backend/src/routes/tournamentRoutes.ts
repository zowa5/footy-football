import { Router } from "express";
import {
  createTournament,
  getTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
  startTournament,
  completeTournament,
  cancelTournament,
  getUserTournaments,
} from "../controllers/tournamentController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @route   POST /api/tournaments
 * @desc    Create a new tournament
 * @access  Private (Manager/Admin)
 */
router.post("/", authenticate, createTournament);

/**
 * @route   GET /api/tournaments
 * @desc    Get all tournaments with filtering
 * @access  Public
 */
router.get("/", getTournaments);

/**
 * @route   GET /api/tournaments/my-tournaments
 * @desc    Get user's tournament history
 * @access  Private
 */
router.get("/my-tournaments", authenticate, getUserTournaments);

/**
 * @route   GET /api/tournaments/:id
 * @desc    Get tournament by ID
 * @access  Public
 */
router.get("/:id", getTournamentById);

/**
 * @route   POST /api/tournaments/:id/join
 * @desc    Join a tournament
 * @access  Private
 */
router.post("/:id/join", authenticate, joinTournament);

/**
 * @route   POST /api/tournaments/:id/leave
 * @desc    Leave a tournament
 * @access  Private
 */
router.post("/:id/leave", authenticate, leaveTournament);

/**
 * @route   PUT /api/tournaments/:id/start
 * @desc    Start a tournament
 * @access  Private (Creator/Admin)
 */
router.put("/:id/start", authenticate, startTournament);

/**
 * @route   PUT /api/tournaments/:id/complete
 * @desc    Complete a tournament
 * @access  Private (Creator/Admin)
 */
router.put("/:id/complete", authenticate, completeTournament);

/**
 * @route   PUT /api/tournaments/:id/cancel
 * @desc    Cancel a tournament
 * @access  Private (Creator/Admin)
 */
router.put("/:id/cancel", authenticate, cancelTournament);

export default router;

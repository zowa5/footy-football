import { Router } from "express";
import {
  getPlayerStats,
  updatePlayerStats,
  getPlayerLeaderboard,
  updatePlayerEnergy,
  getPlayerTransactions,
  addPlayerExperience,
  resetPlayerEnergy,
} from "../controllers/playerController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/common";

const router = Router();

/**
 * @route   GET /api/players/stats
 * @desc    Get current player stats
 * @access  Private - Player only
 */
router.get("/stats", authenticate, authorize(UserRole.PLAYER), getPlayerStats);

/**
 * @route   PUT /api/players/stats
 * @desc    Update player stats
 * @access  Private - Player only
 */
router.put(
  "/stats",
  authenticate,
  authorize(UserRole.PLAYER),
  updatePlayerStats
);

/**
 * @route   GET /api/players/leaderboard
 * @desc    Get player leaderboard
 * @access  Public
 */
router.get("/leaderboard", getPlayerLeaderboard);

/**
 * @route   PUT /api/players/energy
 * @desc    Update player energy
 * @access  Private - Player only
 */
router.put(
  "/energy",
  authenticate,
  authorize(UserRole.PLAYER),
  updatePlayerEnergy
);

/**
 * @route   POST /api/players/energy/reset
 * @desc    Reset player energy to full
 * @access  Private - Player only
 */
router.post(
  "/energy/reset",
  authenticate,
  authorize(UserRole.PLAYER),
  resetPlayerEnergy
);

/**
 * @route   GET /api/players/transactions
 * @desc    Get player transaction history
 * @access  Private - Player only
 */
router.get(
  "/transactions",
  authenticate,
  authorize(UserRole.PLAYER),
  getPlayerTransactions
);

/**
 * @route   POST /api/players/experience
 * @desc    Add experience to player
 * @access  Private - Player only
 */
router.post(
  "/experience",
  authenticate,
  authorize(UserRole.PLAYER),
  addPlayerExperience
);

export default router;

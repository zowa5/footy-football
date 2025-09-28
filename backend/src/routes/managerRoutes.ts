import { Router } from "express";
import {
  getManagerDashboard,
  getManagerFormations,
  purchaseFormation,
  getManagerMatches,
  updateClubInfo,
  getManagerLeaderboard,
  getManagerTransactions,
  getSquad,
  saveCustomFormation,
  getAIPlayers,
  buyAIPlayer,
} from "../controllers/managerController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/common";

const router = Router();

/**
 * @route   GET /api/managers/dashboard
 * @desc    Get manager dashboard data
 * @access  Private - Manager only
 */
router.get(
  "/dashboard",
  authenticate,
  authorize(UserRole.MANAGER),
  getManagerDashboard
);

/**
 * @route   GET /api/managers/formations
 * @desc    Get manager's owned formations
 * @access  Private - Manager only
 */
router.get(
  "/formations",
  authenticate,
  authorize(UserRole.MANAGER),
  getManagerFormations
);

/**
 * @route   POST /api/managers/formations/purchase
 * @desc    Purchase a formation
 * @access  Private - Manager only
 */
router.post(
  "/formations/purchase",
  authenticate,
  authorize(UserRole.MANAGER),
  purchaseFormation
);

/**
 * @route   POST /api/managers/formations/save
 * @desc    Save custom formation
 * @access  Private - Manager only
 */
router.post(
  "/formations/save",
  authenticate,
  authorize(UserRole.MANAGER),
  saveCustomFormation
);

/**
 * @route   GET /api/managers/matches
 * @desc    Get manager's matches
 * @access  Private - Manager only
 */
router.get(
  "/matches",
  authenticate,
  authorize(UserRole.MANAGER),
  getManagerMatches
);

/**
 * @route   GET /api/managers/squad
 * @desc    Get manager's squad
 * @access  Private - Manager only
 */
router.get("/squad", authenticate, authorize(UserRole.MANAGER), getSquad);

/**
 * @route   PUT /api/managers/club
 * @desc    Update club information
 * @access  Private - Manager only
 */
router.put("/club", authenticate, authorize(UserRole.MANAGER), updateClubInfo);

/**
 * @route   GET /api/managers/leaderboard
 * @desc    Get manager leaderboard
 * @access  Public
 */
router.get("/leaderboard", getManagerLeaderboard);

/**
 * @route   GET /api/managers/transactions
 * @desc    Get manager transaction history
 * @access  Private - Manager only
 */
router.get(
  "/transactions",
  authenticate,
  authorize(UserRole.MANAGER),
  getManagerTransactions
);

/**
 * @route   GET /api/managers/ai-players
 * @desc    Get all AI players
 * @access  Private - Manager only
 */
router.get(
  "/ai-players",
  authenticate,
  authorize(UserRole.MANAGER),
  getAIPlayers
);

/**
 * @route   POST /api/managers/ai-players/buy
 * @desc    Purchase an AI player
 * @access  Private - Manager only
 */
router.post(
  "/ai-players/buy",
  authenticate,
  authorize(UserRole.MANAGER),
  buyAIPlayer
);

export default router;

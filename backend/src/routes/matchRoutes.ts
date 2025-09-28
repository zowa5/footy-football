import { Router } from "express";
import {
  createMatch,
  getMatches,
  getMatchById,
  startMatch,
  completeMatch,
  cancelMatch,
  getMatchHistory,
} from "../controllers/matchController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @route   POST /api/matches
 * @desc    Create a new match
 * @access  Private
 */
router.post("/", authenticate, createMatch);

/**
 * @route   GET /api/matches
 * @desc    Get matches with filtering
 * @access  Public
 */
router.get("/", getMatches);

/**
 * @route   GET /api/matches/history
 * @desc    Get user's match history
 * @access  Private
 */
router.get("/history", authenticate, getMatchHistory);

/**
 * @route   GET /api/matches/:id
 * @desc    Get match by ID
 * @access  Public
 */
router.get("/:id", getMatchById);

/**
 * @route   PUT /api/matches/:id/start
 * @desc    Start a match
 * @access  Private
 */
router.put("/:id/start", authenticate, startMatch);

/**
 * @route   PUT /api/matches/:id/complete
 * @desc    Complete a match with results
 * @access  Private
 */
router.put("/:id/complete", authenticate, completeMatch);

/**
 * @route   PUT /api/matches/:id/cancel
 * @desc    Cancel a match
 * @access  Private
 */
router.put("/:id/cancel", authenticate, cancelMatch);

export default router;

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getPlayerDashboard,
  getPlayerSkills,
  acquireSkill,
  toggleSkill,
  upgradeSkill,
  getPlayerMatches,
  getLeaderboard,
} from "../controllers/playerController";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/player/dashboard
 * @desc    Get player dashboard data
 * @access  Private
 */
router.get("/dashboard", getPlayerDashboard);

/**
 * @route   GET /api/player/skills
 * @desc    Get player skills and available skill templates
 * @access  Private
 */
router.get("/skills", getPlayerSkills);

/**
 * @route   POST /api/player/skills/acquire
 * @desc    Acquire a new skill
 * @access  Private
 */
router.post("/skills/acquire", acquireSkill);

/**
 * @route   PUT /api/player/skills/:skillId/toggle
 * @desc    Toggle skill activation
 * @access  Private
 */
router.put("/skills/:skillId/toggle", toggleSkill);

/**
 * @route   PUT /api/player/skills/:skillId/upgrade
 * @desc    Upgrade skill level
 * @access  Private
 */
router.put("/skills/:skillId/upgrade", upgradeSkill);

/**
 * @route   GET /api/player/matches
 * @desc    Get player matches (recent and upcoming)
 * @access  Private
 */
router.get("/matches", getPlayerMatches);

/**
 * @route   GET /api/player/leaderboard
 * @desc    Get leaderboard data with different categories
 * @access  Private
 */
router.get("/leaderboard", getLeaderboard);

export default router;

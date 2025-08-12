import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateLastLogin,
  getAvailableClubs,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { maintenanceCheck } from "../middleware/maintenance";

const router = Router();

/**
 * @route   GET /api/auth/clubs
 * @desc    Get available clubs for player signup
 * @access  Public
 */
router.get("/clubs", getAvailableClubs);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (player or manager)
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getProfile);

/**
 * @route   PUT /api/auth/last-login
 * @desc    Update last login timestamp
 * @access  Private
 */
router.put("/last-login", authenticate, updateLastLogin);

export default router;

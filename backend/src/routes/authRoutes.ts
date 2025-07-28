import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateLastLogin,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

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

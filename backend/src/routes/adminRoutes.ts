import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  addCoinsToUser,
  getAllTransactions,
  getSystemLogs,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
  getSystemStats,
  getAllClubs,
  createClub,
  updateClub,
  deleteClub,
  getReports,
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All admin routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get system dashboard statistics
 * @access  Private (Admin only)
 */
router.get("/dashboard", getDashboardStats);

/**
 * @route   GET /api/admin/stats
 * @desc    Get detailed system statistics
 * @access  Private (Admin only)
 */
router.get("/stats", getSystemStats);

/**
 * @route   GET /api/admin/reports
 * @desc    Get comprehensive reports
 * @access  Private (Admin only)
 */
router.get("/reports", getReports);

// User Management Routes
/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering
 * @access  Private (Admin only)
 */
router.get("/users", getAllUsers);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Admin only)
 */
router.put("/users/:id", updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/users/:id", deleteUser);

/**
 * @route   POST /api/admin/users/:id/add-coins
 * @desc    Add coins to user account
 * @access  Private (Admin only)
 */
router.post("/users/:id/add-coins", addCoinsToUser);

// Club Management Routes
/**
 * @route   GET /api/admin/clubs
 * @desc    Get all clubs (managers with club info)
 * @access  Private (Admin only)
 */
router.get("/clubs", getAllClubs);

/**
 * @route   POST /api/admin/clubs
 * @desc    Create new club
 * @access  Private (Admin only)
 */
router.post("/clubs", createClub);

/**
 * @route   PUT /api/admin/clubs/:id
 * @desc    Update club details
 * @access  Private (Admin only)
 */
router.put("/clubs/:id", updateClub);

/**
 * @route   DELETE /api/admin/clubs/:id
 * @desc    Delete club
 * @access  Private (Admin only)
 */
router.delete("/clubs/:id", deleteClub);

// Transaction Management Routes
/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions
 * @access  Private (Admin only)
 */
router.get("/transactions", getAllTransactions);

// System Logs Routes
/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs
 * @access  Private (Admin only)
 */
router.get("/logs", getSystemLogs);

// Store Management Routes
/**
 * @route   POST /api/admin/store-items
 * @desc    Create new store item
 * @access  Private (Admin only)
 */
router.post("/store-items", createStoreItem);

/**
 * @route   PUT /api/admin/store-items/:id
 * @desc    Update store item
 * @access  Private (Admin only)
 */
router.put("/store-items/:id", updateStoreItem);

/**
 * @route   DELETE /api/admin/store-items/:id
 * @desc    Delete store item
 * @access  Private (Admin only)
 */
router.delete("/store-items/:id", deleteStoreItem);

export default router;

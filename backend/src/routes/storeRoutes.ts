import { Router } from "express";
import {
  getStoreItems,
  getStoreCategories,
  purchaseItem,
  getUserPurchases,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
} from "../controllers/storeController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/common";

const router = Router();

/**
 * @route   GET /api/store/items
 * @desc    Get all store items with filtering and pagination
 * @access  Public
 */
router.get("/items", getStoreItems);

/**
 * @route   GET /api/store/categories
 * @desc    Get store categories
 * @access  Public
 */
router.get("/categories", getStoreCategories);

/**
 * @route   POST /api/store/purchase
 * @desc    Purchase store item
 * @access  Private
 */
router.post("/purchase", authenticate, purchaseItem);

/**
 * @route   GET /api/store/purchases
 * @desc    Get user purchase history
 * @access  Private
 */
router.get("/purchases", authenticate, getUserPurchases);

/**
 * @route   POST /api/store/items
 * @desc    Create new store item
 * @access  Private - Super Admin only
 */
router.post(
  "/items",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  createStoreItem
);

/**
 * @route   PUT /api/store/items/:id
 * @desc    Update store item
 * @access  Private - Super Admin only
 */
router.put(
  "/items/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  updateStoreItem
);

/**
 * @route   DELETE /api/store/items/:id
 * @desc    Delete store item
 * @access  Private - Super Admin only
 */
router.delete(
  "/items/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  deleteStoreItem
);

export default router;

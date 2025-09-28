import { Router } from "express";
import {
  getAllFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  getFormationsByType,
  incrementFormationPopularity,
} from "../controllers/formationController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/common";

const router = Router();

/**
 * @route   GET /api/formations
 * @desc    Get all formations with pagination and filtering
 * @access  Public
 */
router.get("/", getAllFormations);

/**
 * @route   GET /api/formations/type/:type
 * @desc    Get formations by type
 * @access  Public
 */
router.get("/type/:type", getFormationsByType);

/**
 * @route   GET /api/formations/:id
 * @desc    Get formation by ID
 * @access  Public
 */
router.get("/:id", getFormationById);

/**
 * @route   POST /api/formations
 * @desc    Create a new formation
 * @access  Private - Super Admin only
 */
router.post(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  createFormation
);

/**
 * @route   PUT /api/formations/:id
 * @desc    Update formation
 * @access  Private - Super Admin only
 */
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  updateFormation
);

/**
 * @route   DELETE /api/formations/:id
 * @desc    Delete formation
 * @access  Private - Super Admin only
 */
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  deleteFormation
);

/**
 * @route   PUT /api/formations/:id/popularity
 * @desc    Increment formation popularity (when someone uses it)
 * @access  Private - Manager only
 */
router.put(
  "/:id/popularity",
  authenticate,
  authorize(UserRole.MANAGER),
  incrementFormationPopularity
);

export default router;

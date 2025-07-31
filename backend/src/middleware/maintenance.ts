import { Request, Response, NextFunction } from "express";
import { Settings } from "../models/Settings";

export interface MaintenanceRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
  };
}

/**
 * Middleware to check maintenance mode
 * Blocks all non-super-admin users when maintenance mode is enabled
 */
export const maintenanceCheck = async (
  req: MaintenanceRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get settings from database
    const settings = await Settings.findOne();

    // If no settings found or maintenance mode is disabled, continue
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // If maintenance mode is enabled, check if user is super admin
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(503).json({
        success: false,
        message:
          "System is currently under maintenance. Please try again later.",
        maintenanceMode: true,
      });
    }

    // Super admin can proceed
    next();
  } catch (error) {
    console.error("Maintenance check error:", error);
    // On error, allow access to prevent system lockout
    next();
  }
};

import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { extractTokenFromHeader, verifyToken, JWTPayload } from "../utils/jwt";
import { createError } from "./errorHandler";
import { UserRole } from "../types/common";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    email: string;
  };
}
export type AuthRequest = AuthenticatedRequest;

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw createError("Access token is required", 401);
    }

    const decoded: JWTPayload = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw createError("User not found", 401);
    }

    if (!user.isActive) {
      throw createError("Account is deactivated", 401);
    }

    req.user = {
      id: (user._id as any).toString(),
      username: user.username || "",
      role: user.role,
      email: user.email || "",
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw createError("Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw createError("Insufficient permissions", 403);
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded: JWTPayload = verifyToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive) {
        req.user = {
          id: (user._id as any).toString(),
          username: user.username || "",
          role: user.role,
          email: user.email || "",
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    next();
  }
};

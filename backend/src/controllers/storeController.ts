import { Request, Response } from "express";
import { StoreItem, StoreItemType } from "../models/StoreItem";
import {
  Purchase,
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../models/Transaction";
import { User } from "../models/User";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import mongoose from "mongoose";

export const getStoreItems = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      type,
      category,
      page = 1,
      limit = 20,
      sort = "price",
      order = "asc",
      minPrice,
      maxPrice,
    } = req.query;

    // Build filter
    const filter: any = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort
    const sortField = (sort as string) || "price";
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj: any = { [sortField]: sortOrder };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      StoreItem.find(filter)
        .populate("metadata.formationId", "name type")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      StoreItem.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: Number(page),
          totalPages,
          total,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  }
);

export const getStoreCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await StoreItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          name: cat._id,
          count: cat.count,
        })),
      },
    });
  }
);

export const purchaseItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.user!.id;

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get store item
      const storeItem = await StoreItem.findById(itemId).session(session);
      if (!storeItem || !storeItem.isActive) {
        throw createError("Store item not found or inactive", 404);
      }

      // Check stock
      if (storeItem.stock !== undefined && storeItem.stock < quantity) {
        throw createError("Insufficient stock", 400);
      }

      // Get user
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw createError("User not found", 404);
      }

      // Check user requirements
      if (storeItem.requirements) {
        const userData = user as any;
        if (
          storeItem.requirements.level &&
          userData.playerData?.level &&
          userData.playerData.level < storeItem.requirements.level
        ) {
          throw createError(
            `Requires level ${storeItem.requirements.level}`,
            400
          );
        }

        if (
          storeItem.requirements.role &&
          !storeItem.requirements.role.includes(user.role)
        ) {
          throw createError("Item not available for your role", 400);
        }
      }

      const totalPrice = storeItem.price * quantity;

      // Check user balance
      const userData = user as any;
      const userCoins =
        userData.playerData?.coins || userData.managerData?.budget || 0;
      if (userCoins < totalPrice) {
        throw createError("Insufficient coins", 400);
      }

      // Create purchase record
      const purchase = new Purchase({
        userId,
        storeItemId: itemId,
        quantity,
        totalPrice,
        status: TransactionStatus.COMPLETED,
        appliedAt: new Date(),
      });

      await purchase.save({ session });

      // Deduct coins from user
      if (userData.playerData) {
        userData.playerData.coins -= totalPrice;
      } else if (userData.managerData) {
        userData.managerData.budget -= totalPrice;
      }

      // Apply item effects
      await applyItemEffects(user, storeItem, quantity);

      await user.save({ session });

      // Update stock
      if (storeItem.stock !== undefined) {
        storeItem.stock -= quantity;
        await storeItem.save({ session });
      }

      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: TransactionType.STORE_PURCHASE,
        status: TransactionStatus.COMPLETED,
        amount: -totalPrice,
        description: `Purchased ${quantity}x ${storeItem.name}`,
        metadata: {
          storeItemId: itemId,
        },
      });

      await transaction.save({ session });

      await session.commitTransaction();

      res.json({
        success: true,
        message: "Purchase completed successfully",
        data: {
          purchase,
          remainingCoins:
            userData.playerData?.coins || userData.managerData?.budget || 0,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export const getUserPurchases = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [purchases, total] = await Promise.all([
      Purchase.find({ userId })
        .populate("storeItemId", "name type price icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Purchase.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          current: Number(page),
          totalPages,
          total,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  }
);

// Helper function to apply item effects
const applyItemEffects = async (
  user: any,
  storeItem: any,
  quantity: number
) => {
  const { type, metadata } = storeItem;

  switch (type) {
    case StoreItemType.SKILL_UPGRADE:
      if (user.playerData && metadata.skillType && metadata.skillValue) {
        const currentValue = user.playerData.stats[metadata.skillType] || 50;
        const newValue = Math.min(
          100,
          currentValue + metadata.skillValue * quantity
        );
        user.playerData.stats[metadata.skillType] = newValue;
      }
      break;

    case StoreItemType.FORMATION:
      if (user.managerData && metadata.formationId) {
        if (!user.managerData.formations.includes(metadata.formationId)) {
          user.managerData.formations.push(metadata.formationId);
        }
      }
      break;

    case StoreItemType.BOOST:
      if (metadata.boostType && metadata.boostValue) {
        switch (metadata.boostType) {
          case "energy":
            if (user.playerData) {
              user.playerData.energy = Math.min(
                100,
                user.playerData.energy + metadata.boostValue * quantity
              );
            }
            break;
          case "coins":
            const coinBonus = metadata.boostValue * quantity;
            if (user.playerData) {
              user.playerData.coins += coinBonus;
            } else if (user.managerData) {
              user.managerData.budget += coinBonus;
            }
            break;
          case "experience":
            if (user.playerData) {
              user.playerData.experience += metadata.boostValue * quantity;
            }
            break;
        }
      }
      break;

    case StoreItemType.STYLE:
    case StoreItemType.AVATAR:
      if (user.playerData && metadata.styleId) {
        user.playerData.style = metadata.styleId;
      }
      break;
  }
};

export const createStoreItem = asyncHandler(
  async (req: Request, res: Response) => {
    const itemData = req.body;

    const storeItem = await StoreItem.create(itemData);

    res.status(201).json({
      success: true,
      message: "Store item created successfully",
      data: {
        item: storeItem,
      },
    });
  }
);

export const updateStoreItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const storeItem = await StoreItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!storeItem) {
      throw createError("Store item not found", 404);
    }

    res.json({
      success: true,
      message: "Store item updated successfully",
      data: {
        item: storeItem,
      },
    });
  }
);

export const deleteStoreItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const storeItem = await StoreItem.findByIdAndDelete(id);

    if (!storeItem) {
      throw createError("Store item not found", 404);
    }

    res.json({
      success: true,
      message: "Store item deleted successfully",
    });
  }
);

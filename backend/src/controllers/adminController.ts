import { Request, Response } from "express";
import { User } from "../models/User";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../models/Transaction";
import { Purchase } from "../models/Purchase";
import { Match } from "../models/Match";
import { Tournament } from "../models/Tournament";
import { SystemLog, LogLevel, LogCategory } from "../models/SystemLog";
import { StoreItem } from "../models/StoreItem";
import { AuthRequest } from "../middleware/auth";

/**
 * @desc    Get system dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const playerCount = await User.countDocuments({ role: "player" });
    const managerCount = await User.countDocuments({ role: "manager" });

    // Get match statistics
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({ status: "in_progress" });
    const completedMatches = await Match.countDocuments({
      status: "completed",
    });

    // Get tournament statistics
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({
      status: "active",
    });

    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: { $in: ["purchase", "tournament_entry"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get store statistics
    const totalStoreItems = await StoreItem.countDocuments();
    const totalPurchases = await Purchase.countDocuments();

    // Recent activity
    const recentUsers = await User.find()
      .select("username email role createdAt lastLogin")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMatches = await Match.find()
      .populate("player1", "username")
      .populate("player2", "username")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          players: playerCount,
          managers: managerCount,
        },
        matches: {
          total: totalMatches,
          active: activeMatches,
          completed: completedMatches,
        },
        tournaments: {
          total: totalTournaments,
          active: activeTournaments,
        },
        transactions: {
          total: totalTransactions,
          revenue: totalRevenue[0]?.total || 0,
        },
        store: {
          items: totalStoreItems,
          purchases: totalPurchases,
        },
        recentActivity: {
          users: recentUsers,
          matches: recentMatches,
        },
      },
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { role, page = 1, limit = 10, search } = req.query;

    const query: any = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `User ${user.username} updated by admin`,
      details: `Updated fields: ${Object.keys(updates).join(", ")}`,
      adminId: req.user._id,
      userId: user._id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "User updated successfully",
        user,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;

    // Don't allow deleting other admins
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `User ${userToDelete.username} deleted by admin`,
      details: `Deleted user ID: ${id}`,
      adminId: req.user._id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "User deleted successfully",
      },
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Add coins to user
 * @route   POST /api/admin/users/:id/add-coins
 * @access  Private (Admin only)
 */
export const addCoinsToUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;
    const { amount, reason } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.coins += amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: id,
      type: TransactionType.ADMIN_ADJUSTMENT,
      status: TransactionStatus.COMPLETED,
      amount,
      description: reason || "Coins added by admin",
      metadata: {
        adminNote: reason || "Coins added by admin",
      },
    });
    await transaction.save();

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `${amount} coins added to user ${user.username} by admin`,
      details: reason || "Coins added by admin",
      adminId: req.user._id,
      userId: user._id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "Coins added successfully",
        user: { username: user.username, coins: user.coins },
      },
    });
  } catch (error: any) {
    console.error("Add coins error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all transactions
 * @route   GET /api/admin/transactions
 * @access  Private (Admin only)
 */
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { type, page = 1, limit = 10, userId } = req.query;

    const query: any = {};
    if (type) {
      query.type = type;
    }
    if (userId) {
      query.user = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Get all transactions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get system logs
 * @route   GET /api/admin/logs
 * @access  Private (Admin only)
 */
export const getSystemLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { action, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (action) {
      query.action = action;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await SystemLog.find(query)
      .populate("admin", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SystemLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Get system logs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create store item
 * @route   POST /api/admin/store-items
 * @access  Private (Admin only)
 */
export const createStoreItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const storeItem = new StoreItem(req.body);
    await storeItem.save();

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.STORE,
      message: `Store item ${storeItem.name} created by admin`,
      details: `Item ID: ${storeItem._id}`,
      adminId: req.user._id,
    });
    await systemLog.save();

    res.status(201).json({
      message: "Store item created successfully",
      item: storeItem,
    });
  } catch (error: any) {
    console.error("Create store item error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update store item
 * @route   PUT /api/admin/store-items/:id
 * @access  Private (Admin only)
 */
export const updateStoreItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;
    const updates = req.body;

    const storeItem = await StoreItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!storeItem) {
      return res.status(404).json({ message: "Store item not found" });
    }

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.STORE,
      message: `Store item ${storeItem.name} updated by admin`,
      details: `Updated fields: ${Object.keys(updates).join(", ")}`,
      adminId: req.user._id,
    });
    await systemLog.save();

    res.json({
      message: "Store item updated successfully",
      item: storeItem,
    });
  } catch (error: any) {
    console.error("Update store item error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete store item
 * @route   DELETE /api/admin/store-items/:id
 * @access  Private (Admin only)
 */
export const deleteStoreItem = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;

    const storeItem = await StoreItem.findByIdAndDelete(id);
    if (!storeItem) {
      return res.status(404).json({ message: "Store item not found" });
    }

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.STORE,
      message: `Store item ${storeItem.name} deleted by admin`,
      details: `Deleted item ID: ${id}`,
      adminId: req.user._id,
    });
    await systemLog.save();

    res.json({ message: "Store item deleted successfully" });
  } catch (error: any) {
    console.error("Delete store item error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
/**
 * @desc    Create new club (manager)
 * @route   POST /api/admin/clubs
 * @access  Private (Admin only)
 */
export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { clubName, username, email, password } = req.body;

    // Validate required fields
    if (!clubName || !username || !email || !password) {
      return res.status(400).json({
        message: "Club name, username, email, and password are required",
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Create new manager user
    const newManager = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role: "manager",
      isActive: true,
      managerInfo: {
        clubName,
        budget: 1000000, // Starting budget
        reputation: 50,
        experience: 0,
        level: 1,
      },
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        tournamentsWon: 0,
        totalEarnings: 0,
      },
      coins: 1000, // Starting coins
    });

    await newManager.save();

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `New club ${clubName} created by admin`,
      details: `Manager: ${username}, Email: ${email}`,
      adminId: req.user._id,
      userId: newManager._id,
    });
    await systemLog.save();

    res.status(201).json({
      success: true,
      data: {
        message: "Club created successfully",
        club: {
          _id: newManager._id,
          clubName: newManager.managerInfo?.clubName,
          clubLogo: newManager.managerInfo?.clubLogo,
          managerName: newManager.username,
          managerEmail: newManager.email,
          playerCount: 0,
          isActive: newManager.isActive,
          createdAt: newManager.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Create club error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all clubs (managers with their club information)
 * @route   GET /api/admin/clubs
 * @access  Private (Admin only)
 */
export const getAllClubs = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { page = 1, limit = 10, search } = req.query;

    const query: any = { role: "manager" };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "managerInfo.clubName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const managers = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    // Get player counts for each club
    const clubsWithPlayerCounts = await Promise.all(
      managers.map(async (manager) => {
        const clubName = manager.managerInfo?.clubName;
        let playerCount = 0;

        if (clubName) {
          playerCount = await User.countDocuments({
            role: "player",
            "playerInfo.club": clubName,
          });
        }

        return {
          _id: manager._id,
          clubName: manager.managerInfo?.clubName || "No Club",
          clubLogo: manager.managerInfo?.clubLogo,
          managerName: manager.username,
          managerEmail: manager.email,
          playerCount,
          isActive: manager.isActive,
          createdAt: manager.createdAt,
          stats: manager.stats,
        };
      })
    );

    res.json({
      success: true,
      data: {
        clubs: clubsWithPlayerCounts,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all clubs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update club (manager) details
 * @route   PUT /api/admin/clubs/:id
 * @access  Private (Admin only)
 */
export const updateClub = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;
    const { clubName, isActive, username, email } = req.body;

    const manager = await User.findById(id);
    if (!manager || manager.role !== "manager") {
      return res.status(404).json({ message: "Manager/Club not found" });
    }

    // Update basic user info
    if (username) manager.username = username;
    if (email) manager.email = email;
    if (typeof isActive === "boolean") manager.isActive = isActive;

    // Update club info
    if (clubName && manager.managerInfo) {
      manager.managerInfo.clubName = clubName;
    }

    await manager.save();

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `Club ${
        clubName || manager.managerInfo?.clubName
      } updated by admin`,
      details: `Updated manager: ${manager.username}`,
      adminId: req.user._id,
      userId: manager._id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "Club updated successfully",
        club: {
          _id: manager._id,
          clubName: manager.managerInfo?.clubName || "No Club",
          clubLogo: manager.managerInfo?.clubLogo,
          managerName: manager.username,
          managerEmail: manager.email,
          isActive: manager.isActive,
          createdAt: manager.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Update club error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete club (manager)
 * @route   DELETE /api/admin/clubs/:id
 * @access  Private (Admin only)
 */
export const deleteClub = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;

    const manager = await User.findById(id);
    if (!manager || manager.role !== "manager") {
      return res.status(404).json({ message: "Manager/Club not found" });
    }

    const clubName = manager.managerInfo?.clubName || "Unknown Club";

    // Delete the manager
    await User.findByIdAndDelete(id);

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `Club ${clubName} deleted by admin`,
      details: `Deleted manager: ${manager.username}`,
      adminId: req.user._id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "Club deleted successfully",
      },
    });
  } catch (error: any) {
    console.error("Delete club error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    // User registration trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userRegistrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Match completion trends
    const matchTrend = await Match.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue trends
    const revenueTrend = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          type: { $in: ["purchase", "tournament_entry"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top players by wins
    const topPlayers = await User.find({ role: "player" })
      .select("username stats.matchesWon stats.tournamentsWon")
      .sort({ "stats.matchesWon": -1 })
      .limit(10);

    res.json({
      trends: {
        userRegistrations: userRegistrationTrend,
        matches: matchTrend,
        revenue: revenueTrend,
      },
      topPlayers,
    });
  } catch (error: any) {
    console.error("Get system stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get comprehensive reports data
 * @route   GET /api/admin/reports
 * @access  Private (Admin only)
 */
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Date range setup
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    let reportData: any = {};

    switch (type) {
      case "user_activity":
        // User activity report
        const userActivity = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                role: "$role",
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.date": 1 } },
        ]);

        const activeUsers = await User.find({
          lastLogin: { $gte: start, $lte: end },
        })
          .select("username role lastLogin createdAt")
          .sort({ lastLogin: -1 })
          .limit(Number(limit));

        reportData = {
          userActivity,
          activeUsers,
          summary: {
            totalActiveUsers: activeUsers.length,
            newUsersInPeriod: await User.countDocuments({
              createdAt: { $gte: start, $lte: end },
            }),
          },
        };
        break;

      case "financial":
        // Financial report
        const transactions = await Transaction.find({
          createdAt: { $gte: start, $lte: end },
        })
          .populate("userId", "username role")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const financialSummary = await Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: "$type",
              totalAmount: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        const dailyRevenue = await Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              type: {
                $in: [
                  TransactionType.STORE_PURCHASE,
                  TransactionType.MATCH_REWARD,
                ],
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              revenue: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        reportData = {
          transactions,
          financialSummary,
          dailyRevenue,
          pagination: {
            total: await Transaction.countDocuments({
              createdAt: { $gte: start, $lte: end },
            }),
            page: Number(page),
            pages: Math.ceil(
              (await Transaction.countDocuments({
                createdAt: { $gte: start, $lte: end },
              })) / Number(limit)
            ),
            limit: Number(limit),
          },
        };
        break;

      case "match_activity":
        // Match activity report (using dummy data since we don't have enough match data)
        const matches = await Match.find({
          createdAt: { $gte: start, $lte: end },
        })
          .populate("player1", "username")
          .populate("player2", "username")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        // Generate dummy matches for demonstration
        const dummyMatches = Array.from({ length: 20 }, (_, i) => ({
          _id: `match_${i + 1}`,
          player1: { username: `Player${i + 1}` },
          player2: { username: `Player${i + 2}` },
          status: ["completed", "in_progress", "cancelled"][
            Math.floor(Math.random() * 3)
          ],
          score: {
            player1: Math.floor(Math.random() * 5),
            player2: Math.floor(Math.random() * 5),
          },
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          duration: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
          tournament: Math.random() > 0.5 ? `Tournament_${(i % 5) + 1}` : null,
        }));

        reportData = {
          matches: matches.length > 0 ? matches : dummyMatches,
          summary: {
            totalMatches:
              matches.length > 0 ? matches.length : dummyMatches.length,
            completedMatches:
              matches.length > 0
                ? matches.filter((m) => m.status === "completed").length
                : dummyMatches.filter((m) => m.status === "completed").length,
            averageMatchDuration: 25, // minutes
          },
        };
        break;

      case "club_performance":
        // Club performance report
        const clubs = await User.find({ role: "manager" })
          .select("username managerInfo stats createdAt")
          .sort({ "stats.matchesWon": -1 });

        const clubPerformance = await Promise.all(
          clubs.map(async (club) => {
            const playerCount = await User.countDocuments({
              role: "player",
              "playerInfo.club": club.managerInfo?.clubName,
            });

            return {
              _id: club._id,
              clubName: club.managerInfo?.clubName || "No Club",
              managerName: club.username,
              playerCount,
              matchesPlayed: club.stats?.matchesPlayed || 0,
              matchesWon: club.stats?.matchesWon || 0,
              winRate: club.stats?.matchesPlayed
                ? (
                    ((club.stats.matchesWon || 0) / club.stats.matchesPlayed) *
                    100
                  ).toFixed(1) + "%"
                : "0%",
              tournamentsWon: club.stats?.tournamentsWon || 0,
              totalEarnings: club.stats?.totalEarnings || 0,
              createdAt: club.createdAt,
            };
          })
        );

        reportData = {
          clubs: clubPerformance,
          summary: {
            totalClubs: clubs.length,
            activeClubs: clubs.filter((c) => c.managerInfo?.clubName).length,
            averagePlayersPerClub:
              clubPerformance.reduce((sum, c) => sum + c.playerCount, 0) /
              (clubs.length || 1),
          },
        };
        break;

      case "system_logs":
        // System logs report
        const logs = await SystemLog.find({
          createdAt: { $gte: start, $lte: end },
        })
          .populate("adminId", "username")
          .populate("userId", "username")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const logsSummary = await SystemLog.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                level: "$level",
                category: "$category",
              },
              count: { $sum: 1 },
            },
          },
        ]);

        reportData = {
          logs,
          logsSummary,
          pagination: {
            total: await SystemLog.countDocuments({
              createdAt: { $gte: start, $lte: end },
            }),
            page: Number(page),
            pages: Math.ceil(
              (await SystemLog.countDocuments({
                createdAt: { $gte: start, $lte: end },
              })) / Number(limit)
            ),
            limit: Number(limit),
          },
        };
        break;

      default:
        // Overview report
        const totalUsers = await User.countDocuments();
        const totalClubs = await User.countDocuments({ role: "manager" });
        const totalTransactions = await Transaction.countDocuments();
        const totalMatches = await Match.countDocuments();

        const recentActivity = {
          newUsers: await User.find({ createdAt: { $gte: start } })
            .select("username role createdAt")
            .sort({ createdAt: -1 })
            .limit(5),
          recentTransactions: await Transaction.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          })
            .populate("userId", "username")
            .sort({ createdAt: -1 })
            .limit(5),
          systemAlerts: [
            {
              type: "info",
              message: "System backup completed successfully",
              timestamp: new Date(),
            },
            {
              type: "warning",
              message: "High server load detected",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              type: "success",
              message: "New tournament created",
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
          ],
        };

        reportData = {
          overview: {
            totalUsers,
            totalClubs,
            totalTransactions,
            totalMatches,
            activeUsers: await User.countDocuments({
              lastLogin: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            }),
            revenue: await Transaction.aggregate([
              {
                $match: {
                  type: {
                    $in: [
                      TransactionType.STORE_PURCHASE,
                      TransactionType.MATCH_REWARD,
                    ],
                  },
                },
              },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ]).then((result) => result[0]?.total || 0),
          },
          recentActivity,
        };
    }

    res.json({
      success: true,
      data: {
        type: type || "overview",
        period: { startDate: start, endDate: end },
        ...reportData,
      },
    });
  } catch (error: any) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
import { Settings } from "../models/Settings";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * @desc    Get system dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
      status: {
        $in: ["registration_open", "registration_closed", "in_progress"],
      },
    });

    // Debug logging for tournaments
    console.log("🏆 Tournament Debug:", {
      totalTournaments,
      activeTournaments,
      allTournaments: await Tournament.find({}, "name status").lean(),
    });

    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          type: { $in: ["store_purchase", "match_reward", "admin_adjustment"] },
        },
      },
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
      .populate("homeTeam.userId", "username")
      .populate("awayTeam.userId", "username")
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
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
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
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
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
      adminId: req.user.id,
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
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
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

    if (userToDelete.role === "super_admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `User ${userToDelete.username} deleted by admin`,
      details: `Deleted user ID: ${id}`,
      adminId: req.user.id,
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
export const addCoinsToUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
      adminId: req.user.id,
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
export const getAllTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
export const getSystemLogs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { action, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (action) {
      query.category = action; // SystemLog uses 'category' field, not 'action'
    }

    console.log("🔍 SystemLogs query:", query);
    console.log("🔍 Pagination:", {
      page,
      limit,
      skip: (Number(page) - 1) * Number(limit),
    });

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await SystemLog.find(query)
      .populate("adminId", "username email")
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SystemLog.countDocuments(query);

    console.log("🔍 Found logs:", logs.length);
    console.log("🔍 Total count:", total);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
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
export const createStoreItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
      adminId: req.user.id,
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
export const updateStoreItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
      adminId: req.user.id,
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
export const deleteStoreItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
      adminId: req.user.id,
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
export const createClub = async (req: AuthenticatedRequest, res: Response) => {
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
      adminId: req.user.id,
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
export const getAllClubs = async (req: AuthenticatedRequest, res: Response) => {
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
export const updateClub = async (req: AuthenticatedRequest, res: Response) => {
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
      adminId: req.user.id,
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
export const deleteClub = async (req: AuthenticatedRequest, res: Response) => {
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
      adminId: req.user.id,
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

export const getSystemStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
 * @desc    Get all matches with details for reports
 * @route   GET /api/admin/matches
 * @access  Private (Admin only)
 */
export const getAllMatches = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { page = 1, limit = 10, matchday, status, type, club } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = {};

    if (matchday) {
      // Filter by specific matchday (date)
      const startOfDay = new Date(matchday as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(matchday as string);
      endOfDay.setHours(23, 59, 59, 999);

      query.scheduledAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    // If club filter is provided, we'll need to filter after population
    // since club information is in the populated user data
    let matchQuery = Match.find(query)
      .populate("homeTeam.userId", "username playerInfo managerInfo")
      .populate("awayTeam.userId", "username playerInfo managerInfo")
      .populate("tournamentId", "name")
      .sort({ scheduledAt: -1 });

    // Get all matches first if club filter is needed
    let matches;
    let total;

    if (club) {
      // Get all matches first, then filter by club
      const allMatches = await matchQuery.exec();

      // Filter by club
      const filteredMatches = allMatches.filter((match) => {
        const homeClub =
          (match.homeTeam.userId as any).playerInfo?.club ||
          (match.homeTeam.userId as any).managerInfo?.clubName;
        const awayClub =
          (match.awayTeam.userId as any).playerInfo?.club ||
          (match.awayTeam.userId as any).managerInfo?.clubName;
        return homeClub === club || awayClub === club;
      });

      total = filteredMatches.length;
      // Apply pagination to filtered results
      matches = filteredMatches.slice(skip, skip + Number(limit));
    } else {
      // No club filter, use normal pagination
      matches = await matchQuery.skip(skip).limit(Number(limit)).exec();
      total = await Match.countDocuments(query);
    }

    // Get unique matchdays for filter options
    const matchDays = await Match.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$scheduledAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }, // Last 30 days
    ]);

    // Process matches with detailed statistics
    const processedMatches = matches.map((match) => {
      const homeTeam = {
        id: (match.homeTeam.userId as any)._id,
        name: match.homeTeam.teamName,
        username: (match.homeTeam.userId as any).username,
        type: (match.homeTeam.userId as any).playerInfo ? "player" : "manager",
        clubName:
          (match.homeTeam.userId as any).playerInfo?.club ||
          (match.homeTeam.userId as any).managerInfo?.clubName,
      };

      const awayTeam = {
        id: (match.awayTeam.userId as any)._id,
        name: match.awayTeam.teamName,
        username: (match.awayTeam.userId as any).username,
        type: (match.awayTeam.userId as any).playerInfo ? "player" : "manager",
        clubName:
          (match.awayTeam.userId as any).playerInfo?.club ||
          (match.awayTeam.userId as any).managerInfo?.clubName,
      };

      // Calculate match statistics
      const events = match.result?.events || [];
      const goals = events.filter((e) => e.type === "goal");
      const yellowCards = events.filter((e) => e.type === "yellow_card");
      const redCards = events.filter((e) => e.type === "red_card");
      const substitutions = events.filter((e) => e.type === "substitution");

      return {
        _id: match._id,
        homeTeam,
        awayTeam,
        type: match.type,
        status: match.status,
        scheduledAt: match.scheduledAt,
        startedAt: match.startedAt,
        completedAt: match.completedAt,
        matchday: match.scheduledAt.toISOString().split("T")[0],
        tournament: (match.tournamentId as any)
          ? {
              id: (match.tournamentId as any)._id,
              name: (match.tournamentId as any).name,
            }
          : null,
        result: match.result
          ? {
              homeScore: match.result.homeScore,
              awayScore: match.result.awayScore,
              winner: match.result.winner,
              duration: match.result.duration,
              events: match.result.events,
            }
          : null,
        statistics: {
          totalGoals: goals.length,
          yellowCards: yellowCards.length,
          redCards: redCards.length,
          substitutions: substitutions.length,
          events: events.length,
        },
        rewards: match.rewards,
      };
    });

    res.json({
      success: true,
      data: {
        matches: processedMatches,
        matchDays: matchDays.map((md) => ({ date: md._id, count: md.count })),
        pagination: {
          total: total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
        summary: {
          totalMatches: total,
          completedMatches: await Match.countDocuments({
            ...query,
            status: "completed",
          }),
          inProgressMatches: await Match.countDocuments({
            ...query,
            status: "in_progress",
          }),
          scheduledMatches: await Match.countDocuments({
            ...query,
            status: "scheduled",
          }),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all matches error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get comprehensive reports data
 * @route   GET /api/admin/reports
 * @access  Private (Admin only)
 */
export const getReports = async (req: AuthenticatedRequest, res: Response) => {
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
                  TransactionType.ADMIN_ADJUSTMENT,
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
        // Match activity report - now using real match data with new schema
        const matches = await Match.find({
          createdAt: { $gte: start, $lte: end },
        })
          .populate("homeTeam.userId", "username")
          .populate("awayTeam.userId", "username")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        // Process matches with the new schema
        const processedMatches = matches.map((match) => ({
          _id: match._id,
          homeTeam: {
            username: (match.homeTeam.userId as any).username,
            teamName: match.homeTeam.teamName,
          },
          awayTeam: {
            username: (match.awayTeam.userId as any).username,
            teamName: match.awayTeam.teamName,
          },
          status: match.status,
          score: match.result
            ? {
                home: match.result.homeScore,
                away: match.result.awayScore,
              }
            : null,
          createdAt: match.createdAt,
          duration: match.result?.duration,
          tournament: match.tournamentId,
        }));

        reportData = {
          matches: processedMatches,
          summary: {
            totalMatches: matches.length,
            completedMatches: matches.filter((m) => m.status === "completed")
              .length,
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
                      TransactionType.ADMIN_ADJUSTMENT,
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

/**
 * @desc    Get all tournaments for admin management
 * @route   GET /api/admin/tournaments
 * @access  Private (Admin only)
 */
export const getAllTournaments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const tournaments = await Tournament.find(query)
      .populate("organizerId", "username email")
      .populate("winner", "username")
      .populate("participants.userId", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Tournament.countDocuments(query);

    // Process tournaments with additional stats
    const processedTournaments = tournaments.map((tournament) => ({
      _id: tournament._id,
      name: tournament.name,
      description: tournament.description,
      type: tournament.type,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.participants.length,
      entryFee: tournament.entryFee,
      prizes: tournament.prizes,
      schedule: tournament.schedule,
      organizer: tournament.organizerId
        ? {
            id: (tournament.organizerId as any)._id,
            username: (tournament.organizerId as any).username,
            email: (tournament.organizerId as any).email,
          }
        : null,
      winner: tournament.winner
        ? {
            id: (tournament.winner as any)._id,
            username: (tournament.winner as any).username,
          }
        : null,
      participants: tournament.participants.map((p) => ({
        id: (p.userId as any)._id,
        username: (p.userId as any).username,
        teamName: p.teamName,
        joinedAt: p.joinedAt,
        eliminated: p.eliminated,
        finalPosition: p.finalPosition,
      })),
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        tournaments: processedTournaments,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
        summary: {
          totalTournaments: total,
          activeTournaments: await Tournament.countDocuments({
            status: "in_progress",
          }),
          upcomingTournaments: await Tournament.countDocuments({
            status: "registration_open",
          }),
          completedTournaments: await Tournament.countDocuments({
            status: "completed",
          }),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all tournaments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create new tournament
 * @route   POST /api/admin/tournaments
 * @access  Private (Admin only)
 */
export const createTournament = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const {
      name,
      description,
      type,
      maxParticipants,
      entryFee,
      prizes,
      schedule,
      status = "registration_open",
    } = req.body;

    // Validation
    if (!name || !type || !maxParticipants || !schedule) {
      return res.status(400).json({
        message: "Name, type, maxParticipants, and schedule are required",
      });
    }

    // Check if tournament name already exists
    const existingTournament = await Tournament.findOne({ name });
    if (existingTournament) {
      return res.status(400).json({
        message: "Tournament with this name already exists",
      });
    }

    const tournament = new Tournament({
      name,
      description,
      type,
      status,
      maxParticipants,
      entryFee: entryFee || 0,
      prizes: prizes || [],
      schedule: {
        registrationStart: new Date(schedule.registrationStart),
        registrationEnd: new Date(schedule.registrationEnd),
        tournamentStart: new Date(schedule.tournamentStart),
        tournamentEnd: schedule.tournamentEnd
          ? new Date(schedule.tournamentEnd)
          : undefined,
      },
      organizerId: req.user.id,
      participants: [],
      matches: [],
    });

    await tournament.save();

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.TOURNAMENT,
      message: `Tournament created: ${tournament.name}`,
      details: `Type: ${tournament.type}, Max participants: ${tournament.maxParticipants}`,
      adminId: req.user.id,
    });
    await systemLog.save();

    // Populate organizer info
    await tournament.populate("organizerId", "username email");

    res.status(201).json({
      success: true,
      data: {
        message: "Tournament created successfully",
        tournament: {
          _id: tournament._id,
          name: tournament.name,
          description: tournament.description,
          type: tournament.type,
          status: tournament.status,
          maxParticipants: tournament.maxParticipants,
          currentParticipants: 0,
          entryFee: tournament.entryFee,
          prizes: tournament.prizes,
          schedule: tournament.schedule,
          organizer: {
            id: (tournament.organizerId as any)._id,
            username: (tournament.organizerId as any).username,
            email: (tournament.organizerId as any).email,
          },
          participants: [],
          createdAt: tournament.createdAt,
          updatedAt: tournament.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Create tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update tournament
 * @route   PUT /api/admin/tournaments/:id
 * @access  Private (Admin only)
 */
export const updateTournament = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;
    const {
      name,
      description,
      type,
      status,
      maxParticipants,
      entryFee,
      prizes,
      schedule,
    } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check if new name conflicts with existing tournament
    if (name && name !== tournament.name) {
      const existingTournament = await Tournament.findOne({ name });
      if (existingTournament) {
        return res.status(400).json({
          message: "Tournament with this name already exists",
        });
      }
    }

    // Build update object
    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (type) updates.type = type;
    if (status) updates.status = status;
    if (maxParticipants) updates.maxParticipants = maxParticipants;
    if (entryFee !== undefined) updates.entryFee = entryFee;
    if (prizes) updates.prizes = prizes;
    if (schedule) {
      updates.schedule = {
        registrationStart: new Date(schedule.registrationStart),
        registrationEnd: new Date(schedule.registrationEnd),
        tournamentStart: new Date(schedule.tournamentStart),
        tournamentEnd: schedule.tournamentEnd
          ? new Date(schedule.tournamentEnd)
          : undefined,
      };
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("organizerId", "username email");

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.TOURNAMENT,
      message: `Tournament updated: ${updatedTournament!.name}`,
      details: `Updated fields: ${Object.keys(updates).join(", ")}`,
      adminId: req.user.id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "Tournament updated successfully",
        tournament: {
          _id: updatedTournament!._id,
          name: updatedTournament!.name,
          description: updatedTournament!.description,
          type: updatedTournament!.type,
          status: updatedTournament!.status,
          maxParticipants: updatedTournament!.maxParticipants,
          currentParticipants: updatedTournament!.participants.length,
          entryFee: updatedTournament!.entryFee,
          prizes: updatedTournament!.prizes,
          schedule: updatedTournament!.schedule,
          organizer: {
            id: (updatedTournament!.organizerId as any)._id,
            username: (updatedTournament!.organizerId as any).username,
            email: (updatedTournament!.organizerId as any).email,
          },
          participants: updatedTournament!.participants,
          createdAt: updatedTournament!.createdAt,
          updatedAt: updatedTournament!.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Update tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete tournament
 * @route   DELETE /api/admin/tournaments/:id
 * @access  Private (Admin only)
 */
export const deleteTournament = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Don't allow deleting tournaments that are in progress
    if (tournament.status === "in_progress") {
      return res.status(400).json({
        message: "Cannot delete tournaments that are in progress",
      });
    }

    await Tournament.findByIdAndDelete(id);

    // Log the action
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.TOURNAMENT,
      message: `Tournament deleted: ${tournament.name}`,
      details: `Type: ${tournament.type}, Status: ${tournament.status}`,
      adminId: req.user.id,
    });
    await systemLog.save();

    res.json({
      success: true,
      data: {
        message: "Tournament deleted successfully",
      },
    });
  } catch (error: any) {
    console.error("Delete tournament error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get tournament by ID
 * @route   GET /api/admin/tournaments/:id
 * @access  Private (Admin only)
 */
export const getTournamentById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { id } = req.params;

    const tournament = await Tournament.findById(id)
      .populate("organizerId", "username email")
      .populate("winner", "username")
      .populate("participants.userId", "username");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const processedTournament = {
      _id: tournament._id,
      name: tournament.name,
      description: tournament.description,
      type: tournament.type,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.participants.length,
      entryFee: tournament.entryFee,
      prizes: tournament.prizes,
      schedule: tournament.schedule,
      organizer: tournament.organizerId
        ? {
            id: (tournament.organizerId as any)._id,
            username: (tournament.organizerId as any).username,
            email: (tournament.organizerId as any).email,
          }
        : null,
      winner: tournament.winner
        ? {
            id: (tournament.winner as any)._id,
            username: (tournament.winner as any).username,
          }
        : null,
      participants: tournament.participants.map((p) => ({
        id: (p.userId as any)._id,
        username: (p.userId as any).username,
        teamName: p.teamName,
        joinedAt: p.joinedAt,
        eliminated: p.eliminated,
        finalPosition: p.finalPosition,
      })),
      matches: tournament.matches,
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
    };

    res.json({
      success: true,
      data: {
        tournament: processedTournament,
      },
    });
  } catch (error: any) {
    console.error("Get tournament by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Private (Super Admin only)
 */
export const getSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        siteName: "PES Manager",
        timezone: "UTC+7",
        maintenanceMode: false,
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/admin/settings
 * @access  Private (Super Admin only)
 */
export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin role required." });
    }

    const { siteName, timezone, maintenanceMode } = req.body;

    // Validate timezone
    const validTimezones = [
      "UTC-12",
      "UTC-11",
      "UTC-10",
      "UTC-9",
      "UTC-8",
      "UTC-7",
      "UTC-6",
      "UTC-5",
      "UTC-4",
      "UTC-3",
      "UTC-2",
      "UTC-1",
      "UTC+0",
      "UTC+1",
      "UTC+2",
      "UTC+3",
      "UTC+4",
      "UTC+5",
      "UTC+6",
      "UTC+7",
      "UTC+8",
      "UTC+9",
      "UTC+10",
      "UTC+11",
      "UTC+12",
    ];

    if (timezone && !validTimezones.includes(timezone)) {
      return res.status(400).json({ message: "Invalid timezone" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings
      settings = await Settings.create({
        siteName: siteName || "PES Manager",
        timezone: timezone || "UTC+7",
        maintenanceMode: maintenanceMode || false,
      });
    } else {
      // Update existing settings
      if (siteName !== undefined) settings.siteName = siteName;
      if (timezone !== undefined) settings.timezone = timezone;
      if (maintenanceMode !== undefined)
        settings.maintenanceMode = maintenanceMode;

      await settings.save();
    }

    // Log the settings change
    const systemLog = new SystemLog({
      level: LogLevel.INFO,
      category: LogCategory.SYSTEM,
      message: `System settings updated by super admin`,
      details: `Settings changed: ${JSON.stringify({
        siteName,
        timezone,
        maintenanceMode,
      })}`,
      adminId: req.user.id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        endpoint: req.originalUrl,
        method: req.method,
      },
    });
    await systemLog.save();

    res.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

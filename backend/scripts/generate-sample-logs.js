const mongoose = require("mongoose");

// Define enums
const LogLevel = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

const LogCategory = {
  AUTH: "auth",
  USER_MANAGEMENT: "user_management",
  TOURNAMENT: "tournament",
  MATCH: "match",
  STORE: "store",
  SYSTEM: "system",
  SECURITY: "security",
};

// Define schema
const systemLogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: Object.values(LogLevel),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(LogCategory),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const SystemLog = mongoose.model("SystemLog", systemLogSchema);

async function generateSampleLogs() {
  try {
    // Connect to database
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("Connected to MongoDB");

    // Sample logs
    const sampleLogs = [
      {
        level: LogLevel.INFO,
        category: LogCategory.AUTH,
        message: "User logged in successfully",
        details: "User authentication completed",
        metadata: {
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
      {
        level: LogLevel.WARNING,
        category: LogCategory.SYSTEM,
        message: "High memory usage detected",
        details: "System memory usage is above 80%",
        metadata: {
          memoryUsage: "85%",
          timestamp: new Date(),
        },
      },
      {
        level: LogLevel.ERROR,
        category: LogCategory.TOURNAMENT,
        message: "Failed to create tournament",
        details: "Tournament validation failed due to invalid date range",
        metadata: {
          errorCode: "INVALID_DATE_RANGE",
          endpoint: "/api/admin/tournaments",
        },
      },
      {
        level: LogLevel.INFO,
        category: LogCategory.USER_MANAGEMENT,
        message: "New user registered",
        details: "User account created successfully",
        metadata: {
          ip: "192.168.1.101",
          registrationMethod: "email",
        },
      },
      {
        level: LogLevel.CRITICAL,
        category: LogCategory.SECURITY,
        message: "Multiple failed login attempts detected",
        details: "Potential brute force attack from IP 192.168.1.999",
        metadata: {
          ip: "192.168.1.999",
          attempts: 10,
          blocked: true,
        },
      },
      {
        level: LogLevel.INFO,
        category: LogCategory.MATCH,
        message: "Match created successfully",
        details: "New match scheduled between Team A and Team B",
        metadata: {
          matchId: "507f1f77bcf86cd799439011",
          teams: ["Team A", "Team B"],
        },
      },
      {
        level: LogLevel.WARNING,
        category: LogCategory.STORE,
        message: "Low inventory warning",
        details: "Store item inventory below threshold",
        metadata: {
          itemId: "507f1f77bcf86cd799439012",
          quantity: 5,
          threshold: 10,
        },
      },
    ];

    // Insert sample logs
    await SystemLog.deleteMany({}); // Clear existing logs
    await SystemLog.insertMany(sampleLogs);

    const count = await SystemLog.countDocuments();
    console.log(`✅ Generated ${count} sample logs`);

    // Show some logs
    const logs = await SystemLog.find().sort({ createdAt: -1 }).limit(3);
    console.log("\n📋 Sample logs:");
    logs.forEach((log) => {
      console.log(`- ${log.level.toUpperCase()}: ${log.message}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

generateSampleLogs();

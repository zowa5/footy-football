// Create Super Admin Script
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("🔧 Creating Super Admin...");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: String,
    bio: String,
    playerInfo: {
      firstName: String,
      lastName: String,
      position: String,
      age: Number,
      height: Number,
      weight: Number,
      nationality: String,
      club: String,
      skills: {
        pace: Number,
        shooting: Number,
        passing: Number,
        dribbling: Number,
        defending: Number,
        physical: Number,
      },
      style: String,
    },
    managerInfo: {
      clubName: String,
      budget: Number,
      reputation: Number,
      experience: Number,
      level: Number,
    },
    coins: { type: Number, default: 1000 },
    energy: { type: Number, default: 100 },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      tournamentsWon: { type: Number, default: 0 },
      skillPoints: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const main = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("✅ MongoDB Connected");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "super_admin" });
    if (existingSuperAdmin) {
      console.log("⚠️ Super Admin already exists:");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log("   Password: admin123");
      process.exit(0);
    }

    console.log("👤 Creating Super Admin user...");

    const superAdmin = {
      username: "superadmin",
      email: "admin@footyclub.com",
      password: hashedPassword,
      role: "super_admin",
      profilePicture:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
      bio: "System Administrator - Full access to all system features",
      coins: 1000000, // 1 million coins
      energy: 100,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        yellowCards: 0,
        redCards: 0,
        tournamentsWon: 0,
        skillPoints: 9999,
      },
    };

    await User.create(superAdmin);

    console.log("✅ Super Admin created successfully!");
    console.log("📋 Login Details:");
    console.log("   Email: admin@footyclub.com");
    console.log("   Password: admin123");
    console.log("   Role: super_admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

main();

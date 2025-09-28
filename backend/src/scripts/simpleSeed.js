// Simple working seed script
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("🚀 Starting simple seed script...");

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

    console.log("🧹 Clearing existing users...");
    await User.deleteMany({});
    console.log("✅ Users cleared");

    console.log("🌱 Creating club data...");

    const hashedPassword = await bcrypt.hash("password123", 10);
    const clubs = ["Arsenal FC", "Manchester United", "Liverpool FC"];
    let usersToCreate = [];

    for (let i = 0; i < clubs.length; i++) {
      const clubName = clubs[i];

      // Create manager
      const manager = {
        username: `manager_${clubName.toLowerCase().replace(/\s+/g, "_")}`,
        email: `manager@${clubName.toLowerCase().replace(/\s+/g, "")}.com`,
        password: hashedPassword,
        role: "manager",
        bio: `Manager of ${clubName}`,
        managerInfo: {
          clubName: clubName,
          budget: 50000000,
          reputation: 85,
          experience: 10,
          level: 5,
        },
        coins: 100000,
        energy: 100,
      };
      usersToCreate.push(manager);

      // Create 3 players for this club
      const positions = ["ST", "MF", "DF"];
      for (let j = 0; j < 3; j++) {
        const player = {
          username: `player_${clubName.replace(/\s+/g, "")}_${j}`.toLowerCase(),
          email: `player${j}@${clubName.toLowerCase().replace(/\s+/g, "")}.com`,
          password: hashedPassword,
          role: "player",
          bio: `Professional player at ${clubName}`,
          playerInfo: {
            firstName: `Player${j}`,
            lastName: `${clubName.split(" ")[0]}`,
            position: positions[j],
            age: 25,
            height: 180,
            weight: 75,
            nationality: "England",
            club: clubName,
            skills: {
              pace: 80,
              shooting: 75,
              passing: 70,
              dribbling: 78,
              defending: 65,
              physical: 82,
            },
            style: "balanced",
          },
          coins: 15000,
          energy: 95,
          stats: {
            matchesPlayed: 50,
            matchesWon: 30,
            goals: 10,
            assists: 8,
            cleanSheets: 0,
            yellowCards: 2,
            redCards: 0,
            tournamentsWon: 1,
            skillPoints: 100,
          },
        };
        usersToCreate.push(player);
      }
    }

    console.log(`📥 Inserting ${usersToCreate.length} users...`);
    await User.insertMany(usersToCreate);

    const finalCount = await User.countDocuments();
    console.log(`✅ Successfully created ${finalCount} users!`);

    const managers = await User.countDocuments({ role: "manager" });
    const players = await User.countDocuments({ role: "player" });
    console.log(`   - ${managers} managers`);
    console.log(`   - ${players} players`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

main();

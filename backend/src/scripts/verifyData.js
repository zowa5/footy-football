// Simple script to verify seeded data
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const verifyData = async () => {
  try {
    // Define the User schema again (simplified for verification)
    const UserSchema = new mongoose.Schema(
      {
        username: String,
        email: String,
        password: String,
        role: String,
        playerInfo: {
          firstName: String,
          lastName: String,
          position: String,
          club: String,
        },
        managerInfo: {
          clubName: String,
          budget: Number,
        },
      },
      { timestamps: true }
    );

    const User = mongoose.model("User", UserSchema);

    const totalUsers = await User.countDocuments();
    const managers = await User.countDocuments({ role: "manager" });
    const players = await User.countDocuments({ role: "player" });

    console.log("📊 Database Statistics:");
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Managers: ${managers}`);
    console.log(`   Players: ${players}`);

    if (managers > 0) {
      console.log("\n🏆 Sample Manager Data:");
      const sampleManager = await User.findOne({ role: "manager" });
      console.log(`   Username: ${sampleManager.username}`);
      console.log(`   Club: ${sampleManager.managerInfo?.clubName}`);
      console.log(`   Budget: ${sampleManager.managerInfo?.budget}`);
    }

    if (players > 0) {
      console.log("\n⚽ Sample Player Data:");
      const samplePlayer = await User.findOne({ role: "player" });
      console.log(`   Username: ${samplePlayer.username}`);
      console.log(
        `   Name: ${samplePlayer.playerInfo?.firstName} ${samplePlayer.playerInfo?.lastName}`
      );
      console.log(`   Position: ${samplePlayer.playerInfo?.position}`);
      console.log(`   Club: ${samplePlayer.playerInfo?.club}`);
    }

    // Show clubs
    const clubs = await User.distinct("managerInfo.clubName", {
      role: "manager",
    });
    console.log(`\n🏟️  Clubs Created: ${clubs.length}`);
    clubs.forEach((club, index) => {
      console.log(`   ${index + 1}. ${club}`);
    });
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  }
};

const main = async () => {
  await connectDB();
  await verifyData();
  console.log("\n🎉 Verification completed!");
  process.exit(0);
};

main().catch(console.error);

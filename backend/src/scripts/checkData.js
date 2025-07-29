const mongoose = require("mongoose");

// Simple test to check tournaments in database
async function checkTournaments() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("🔌 Connected to MongoDB");

    // Check tournaments collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name)
    );

    // Check tournaments
    const tournaments = await db.collection("tournaments").find({}).toArray();
    console.log(`\n🏆 Found ${tournaments.length} tournaments:`);

    tournaments.forEach((tournament) => {
      console.log(`\n📋 Tournament: ${tournament.name}`);
      console.log(`   Type: ${tournament.type}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(
        `   Participants: ${tournament.participants?.length || 0}/${
          tournament.maxParticipants
        }`
      );
      console.log(
        `   Entry Fee: ${tournament.entryFee?.toLocaleString()} coins`
      );
      console.log(`   Created: ${tournament.createdAt}`);
    });

    // Check users
    const users = await db.collection("users").find({}).toArray();
    console.log(`\n👥 Found ${users.length} users:`);
    users.slice(0, 5).forEach((user) => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Database check completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkTournaments();

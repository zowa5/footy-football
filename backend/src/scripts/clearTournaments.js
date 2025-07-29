const mongoose = require("mongoose");

// Script to clear existing tournament data
async function clearTournaments() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("🔌 Connected to MongoDB");

    // Clear existing tournaments
    const result = await mongoose.connection.db
      .collection("tournaments")
      .deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} existing tournaments`);

    await mongoose.disconnect();
    console.log("✅ Tournament data cleared successfully");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

clearTournaments();

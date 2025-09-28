const mongoose = require("mongoose");
const { User } = require("../models/User");

// Connect to MongoDB
async function updatePlayerInfo() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("Connected to MongoDB");

    // Get all players
    const players = await User.find({ role: "player" });
    console.log(`Found ${players.length} players`);

    if (players.length === 0) {
      console.log("No players found.");
      await mongoose.disconnect();
      return;
    }

    let updatedCount = 0;

    for (const player of players) {
      const oldPlayerInfo = player.playerInfo;

      // Skip if already has new structure
      if (oldPlayerInfo && oldPlayerInfo.offensiveAwareness !== undefined) {
        console.log(
          `Player ${player.username} already has new structure, skipping...`
        );
        continue;
      }

      // Convert old structure to new structure
      const newPlayerInfo = {
        firstName: oldPlayerInfo?.firstName || "Player",
        lastName: oldPlayerInfo?.lastName || "User",
        position: oldPlayerInfo?.position || "Unknown",
        age: oldPlayerInfo?.age || 18,
        height: oldPlayerInfo?.height || 175,
        weight: oldPlayerInfo?.weight || 70,
        nationality: oldPlayerInfo?.nationality || "Unknown",
        club: oldPlayerInfo?.club || "Free Agent",

        // Convert old skills to new structure
        offensiveAwareness: oldPlayerInfo?.skills?.shooting || 50,
        dribbling: oldPlayerInfo?.skills?.dribbling || 50,
        lowPass: oldPlayerInfo?.skills?.passing || 50,
        finishing: oldPlayerInfo?.skills?.shooting || 50,
        placeKicking: oldPlayerInfo?.skills?.shooting || 50,
        speed: oldPlayerInfo?.skills?.pace || 50,
        kickingPower: oldPlayerInfo?.skills?.shooting || 50,
        physicalContact: oldPlayerInfo?.skills?.physical || 50,
        stamina: oldPlayerInfo?.skills?.physical || 50,
        ballWinning: oldPlayerInfo?.skills?.defending || 50,
        ballControl: oldPlayerInfo?.skills?.dribbling || 50,
        tightPossession: oldPlayerInfo?.skills?.dribbling || 50,
        loftedPass: oldPlayerInfo?.skills?.passing || 50,
        heading: oldPlayerInfo?.skills?.shooting || 50,
        curl: oldPlayerInfo?.skills?.passing || 50,
        acceleration: oldPlayerInfo?.skills?.pace || 50,
        jump: oldPlayerInfo?.skills?.physical || 50,
        balance: oldPlayerInfo?.skills?.physical || 50,
        defensiveAwareness: oldPlayerInfo?.skills?.defending || 50,
        aggression: oldPlayerInfo?.skills?.defending || 50,
        gkAwareness: oldPlayerInfo?.skills?.defending || 50,
        gkClearing: oldPlayerInfo?.skills?.defending || 50,
        gkReach: oldPlayerInfo?.skills?.defending || 50,
        gkCatching: oldPlayerInfo?.skills?.defending || 50,
        gkReflexes: oldPlayerInfo?.skills?.defending || 50,
        weakFootUsage: 2,
        weakFootAcc: 2,
        form: 5,
        injuryResistance: 2,
        style: oldPlayerInfo?.style || "balanced",
      };

      // Update player
      await User.findByIdAndUpdate(player._id, {
        playerInfo: newPlayerInfo,
      });

      console.log(`Updated player: ${player.username}`);
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} players`);
    console.log(`📊 Total players: ${players.length}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`⏭️ Skipped: ${players.length - updatedCount}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updatePlayerInfo();

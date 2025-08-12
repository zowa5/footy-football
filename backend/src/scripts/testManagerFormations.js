const mongoose = require("mongoose");

// Test the manager formations API endpoint
async function testManagerFormations() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("🔌 Connected to MongoDB");

    // Get a manager user for testing
    const db = mongoose.connection.db;
    const users = await db
      .collection("users")
      .find({ role: "manager" })
      .limit(1)
      .toArray();

    if (users.length === 0) {
      console.log("❌ No manager users found for testing");
      return;
    }

    const testManager = users[0];
    console.log(
      `👤 Using manager: ${testManager.username} (${testManager._id})`
    );

    // Check custom formations for this manager
    const customFormations = await db
      .collection("customformations")
      .find({ createdBy: testManager._id })
      .toArray();

    console.log(
      `\n📋 Found ${customFormations.length} custom formations for manager:`
    );

    customFormations.forEach((formation, index) => {
      console.log(`\n${index + 1}. ${formation.name}`);
      console.log(`   Type: ${formation.formationType}`);
      console.log(`   Created: ${formation.createdAt}`);
      console.log(`   Positions: ${formation.positions?.length || 0}`);

      if (formation.positions && formation.positions.length > 0) {
        const assignedPlayers = formation.positions.filter(
          (pos) => pos.playerId
        );
        console.log(`   Assigned Players: ${assignedPlayers.length}`);

        assignedPlayers.forEach((pos, posIndex) => {
          console.log(
            `     ${posIndex + 1}. ${pos.positionName}: ${
              pos.playerName || pos.playerId
            }`
          );
        });
      }
    });

    // Simulate the API response structure
    const apiResponse = {
      success: true,
      data: {
        formations: [], // Default formations owned by manager
        customFormations: customFormations,
      },
    };

    console.log(`\n📡 Simulated API Response:`);
    console.log(JSON.stringify(apiResponse, null, 2));

    await mongoose.disconnect();
    console.log("\n✅ Test completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testManagerFormations();




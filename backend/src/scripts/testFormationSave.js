const mongoose = require("mongoose");

// Test saving a custom formation
async function testFormationSave() {
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

    // Test formation data
    const testFormationData = {
      name: "Test Formation 4-4-2",
      formationType: "4-4-2",
      positions: [
        {
          positionId: "gk",
          positionName: "GK",
          playerId: null,
          playerName: null,
          x: 50,
          y: 90,
        },
        {
          positionId: "lb",
          positionName: "LB",
          playerId: null,
          playerName: null,
          x: 15,
          y: 70,
        },
        {
          positionId: "cb1",
          positionName: "CB",
          playerId: testManager._id, // Assign the manager as a player for testing
          playerName: testManager.username,
          x: 35,
          y: 70,
        },
        {
          positionId: "cb2",
          positionName: "CB",
          playerId: null,
          playerName: null,
          x: 65,
          y: 70,
        },
        {
          positionId: "rb",
          positionName: "RB",
          playerId: null,
          playerName: null,
          x: 85,
          y: 70,
        },
        {
          positionId: "lm",
          positionName: "LM",
          playerId: null,
          playerName: null,
          x: 15,
          y: 45,
        },
        {
          positionId: "cm1",
          positionName: "CM",
          playerId: null,
          playerName: null,
          x: 35,
          y: 45,
        },
        {
          positionId: "cm2",
          positionName: "CM",
          playerId: null,
          playerName: null,
          x: 65,
          y: 45,
        },
        {
          positionId: "rm",
          positionName: "RM",
          playerId: null,
          playerName: null,
          x: 85,
          y: 45,
        },
        {
          positionId: "st1",
          positionName: "ST",
          playerId: null,
          playerName: null,
          x: 35,
          y: 20,
        },
        {
          positionId: "st2",
          positionName: "ST",
          playerId: null,
          playerName: null,
          x: 65,
          y: 20,
        },
      ],
      createdBy: testManager._id,
      isCustom: true,
    };

    // Try to save the formation
    const CustomFormation = mongoose.model(
      "CustomFormation",
      new mongoose.Schema(
        {
          name: String,
          formationType: String,
          positions: [
            {
              positionId: String,
              positionName: String,
              playerId: mongoose.Schema.Types.ObjectId,
              playerName: String,
              x: Number,
              y: Number,
            },
          ],
          createdBy: mongoose.Schema.Types.ObjectId,
          isCustom: Boolean,
        },
        { timestamps: true }
      )
    );

    const savedFormation = await CustomFormation.create(testFormationData);
    console.log("✅ Formation saved successfully!");
    console.log(`📋 Formation ID: ${savedFormation._id}`);
    console.log(`📋 Formation Name: ${savedFormation.name}`);
    console.log(`📋 Created by: ${savedFormation.createdBy}`);
    console.log(`📋 Positions: ${savedFormation.positions.length}`);

    await mongoose.disconnect();
    console.log("\n✅ Test completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testFormationSave();

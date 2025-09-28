const mongoose = require("mongoose");

// Check formations in database
async function checkFormations() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("🔌 Connected to MongoDB");

    // Check formations collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name)
    );

    // Check formations
    const formations = await db.collection("formations").find({}).toArray();
    console.log(`\n⚽ Found ${formations.length} formations:`);

    if (formations.length === 0) {
      console.log("❌ No formations found in database");
    } else {
      formations.forEach((formation, index) => {
        console.log(`\n📋 Formation ${index + 1}: ${formation.name}`);
        console.log(`   Type: ${formation.type}`);
        console.log(`   Is Default: ${formation.isDefault}`);
        console.log(`   Popularity: ${formation.popularity}`);
        console.log(`   Price: ${formation.price}`);
        console.log(`   Positions: ${formation.positions?.length || 0}`);
        console.log(`   Created: ${formation.createdAt}`);
        console.log(`   Updated: ${formation.updatedAt}`);

        if (formation.positions && formation.positions.length > 0) {
          console.log(`   Position details:`);
          formation.positions.forEach((pos, posIndex) => {
            console.log(
              `     ${posIndex + 1}. ${pos.positionName || pos.name} (${
                pos.x
              }, ${pos.y})`
            );
            if (pos.playerId) {
              console.log(`        Player: ${pos.playerName || pos.playerId}`);
            }
          });
        }
      });
    }

    // Check if there are any custom formations saved by managers
    const customFormations = await db
      .collection("formations")
      .find({ isCustom: true })
      .toArray();
    console.log(
      `\n🎯 Found ${customFormations.length} custom formations in formations collection:`
    );

    if (customFormations.length > 0) {
      customFormations.forEach((formation, index) => {
        console.log(`\n📋 Custom Formation ${index + 1}: ${formation.name}`);
        console.log(`   Created by: ${formation.createdBy}`);
        console.log(`   Created: ${formation.createdAt}`);
      });
    }

    // Check customformations collection
    const customFormationsCollection = await db
      .collection("customformations")
      .find({})
      .toArray();
    console.log(
      `\n🎯 Found ${customFormationsCollection.length} custom formations in customformations collection:`
    );

    if (customFormationsCollection.length > 0) {
      customFormationsCollection.forEach((formation, index) => {
        console.log(`\n📋 Custom Formation ${index + 1}: ${formation.name}`);
        console.log(`   Type: ${formation.formationType}`);
        console.log(`   Created by: ${formation.createdBy}`);
        console.log(`   Created: ${formation.createdAt}`);
        console.log(`   Positions: ${formation.positions?.length || 0}`);

        if (formation.positions && formation.positions.length > 0) {
          console.log(`   Position details:`);
          formation.positions.forEach((pos, posIndex) => {
            console.log(
              `     ${posIndex + 1}. ${pos.positionName} (${pos.x}, ${pos.y})`
            );
            if (pos.playerId) {
              console.log(`        Player: ${pos.playerName || pos.playerId}`);
            }
          });
        }
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Formation check completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkFormations();

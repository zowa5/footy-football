const mongoose = require("mongoose");
const { User } = require("../models/User");

// Connect to MongoDB
async function updateLastLogin() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/pes-football"
    );
    console.log("Connected to MongoDB");

    // Update all users that don't have lastLogin field
    const result = await User.updateMany(
      { lastLogin: { $exists: false } },
      {
        $set: {
          lastLogin: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last 7 days
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} users with lastLogin field`);

    // Also update users with null lastLogin
    const result2 = await User.updateMany(
      { lastLogin: null },
      {
        $set: {
          lastLogin: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last 7 days
        },
      }
    );

    console.log(`Updated ${result2.modifiedCount} users with null lastLogin`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating lastLogin:", error);
    process.exit(1);
  }
}

updateLastLogin();

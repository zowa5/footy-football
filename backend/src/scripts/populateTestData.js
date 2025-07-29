const mongoose = require("mongoose");
const { User } = require("../models/User");
const {
  Transaction,
  TransactionType,
  TransactionStatus,
} = require("../models/Transaction");

// Connect to MongoDB
async function populateTestData() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/pes-football"
    );
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log("No users found. Create some users first.");
      await mongoose.disconnect();
      return;
    }

    // Create some test transactions for the past 30 days
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const date = new Date(
        now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000
      );

      // Random transaction type
      const types = [
        TransactionType.STORE_PURCHASE,
        TransactionType.MATCH_REWARD,
        TransactionType.ADMIN_ADJUSTMENT,
        TransactionType.DAILY_BONUS,
        TransactionType.LEVEL_REWARD,
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];

      // Random amount based on type
      let amount;
      let description;
      switch (randomType) {
        case TransactionType.STORE_PURCHASE:
          amount = -(Math.floor(Math.random() * 500) + 50); // Negative for purchases
          description = "Store item purchase";
          break;
        case TransactionType.MATCH_REWARD:
          amount = Math.floor(Math.random() * 200) + 50;
          description = "Match completion reward";
          break;
        case TransactionType.ADMIN_ADJUSTMENT:
          amount = Math.floor(Math.random() * 1000) + 100;
          description = "Admin coin adjustment";
          break;
        case TransactionType.DAILY_BONUS:
          amount = 100;
          description = "Daily login bonus";
          break;
        case TransactionType.LEVEL_REWARD:
          amount = Math.floor(Math.random() * 300) + 100;
          description = "Level up reward";
          break;
        default:
          amount = 100;
          description = "Miscellaneous transaction";
      }

      transactions.push({
        userId: randomUser._id,
        type: randomType,
        status: TransactionStatus.COMPLETED,
        amount: amount,
        description: description,
        createdAt: date,
        updatedAt: date,
      });
    }

    // Insert transactions
    const result = await Transaction.insertMany(transactions);
    console.log(`Created ${result.length} test transactions`);

    // Update lastLogin for all users to recent dates
    const userUpdates = users.map(async (user) => {
      const randomDaysAgo = Math.floor(Math.random() * 7); // Within last week
      const lastLoginDate = new Date(
        now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000
      );
      return User.findByIdAndUpdate(user._id, { lastLogin: lastLoginDate });
    });

    await Promise.all(userUpdates);
    console.log(`Updated lastLogin for ${users.length} users`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error populating test data:", error);
    process.exit(1);
  }
}

populateTestData();

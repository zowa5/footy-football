// Debug version
const mongoose = require("mongoose");

console.log("🚀 Starting debug script...");

const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const testScript = async () => {
  try {
    console.log("🧪 Running test operations...");

    // Test connection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);

    // Simple test insert
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now },
    });

    const Test = mongoose.model("Test", TestSchema);
    const testDoc = new Test({ name: "debug-test" });
    await testDoc.save();
    console.log("✅ Test document created successfully");

    // Clean up
    await Test.deleteOne({ name: "debug-test" });
    console.log("🧹 Test document cleaned up");
  } catch (error) {
    console.error("❌ Test error:", error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await testScript();
  console.log("🎉 Debug script completed!");
  process.exit(0);
};

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});

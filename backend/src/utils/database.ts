import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const attemptConnection = async (mongoURI: string, attempt: number = 1) => {
  try {
    console.log(`📡 Connection attempt ${attempt} of ${MAX_RETRIES}...`);
    return await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxIdleTimeMS: 60000,
    });
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.log(`⚠️ Connection failed, retrying in ${RETRY_INTERVAL/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return attemptConnection(mongoURI, attempt + 1);
    }
    throw error;
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    console.log("🔍 MongoDB URI:", mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://******:******@"));

    console.log("🔄 Attempting to connect to MongoDB...");
    
    const conn = await attemptConnection(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

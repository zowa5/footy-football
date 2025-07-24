import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { authRouter } from "./routes/auth.routes";
import { playerRouter } from "./routes/player.routes";
import { storeRouter } from "./routes/store.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/player", playerRouter);
app.use("/api/store", storeRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

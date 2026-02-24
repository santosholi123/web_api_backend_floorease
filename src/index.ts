import "dotenv/config";
import mongoose from "mongoose";
import { config } from "./config";
import { connectDatabase } from "./database/mongodb";
import app from "./app";

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected successfully");
    } else {
      await connectDatabase();
    }

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

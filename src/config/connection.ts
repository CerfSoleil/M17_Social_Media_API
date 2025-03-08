import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGODB_URI as string;

if (!connectionString) {
    console.error("MongoDB connection string not found in .env");
    process.exit(1);
}

mongoose.connect(connectionString);

export default mongoose.connection;
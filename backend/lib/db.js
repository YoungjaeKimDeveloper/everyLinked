import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB CONNECTED SUCCESSFULLY ✅");
  } catch (error) {
    console.log(`FAILED TO CONNECT DB:  ${error.message}`);
    process.exit(1);
  }
};

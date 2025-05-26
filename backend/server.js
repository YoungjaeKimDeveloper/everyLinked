import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

// SINGLE TON
// Middle ware = Middle + Software

const app = express();
// parse JSON request body
app.use(express.json());
// to check the cookie
app.use(cookieParser());
// Version Control
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ${PORT}`);
  connectDB();
});

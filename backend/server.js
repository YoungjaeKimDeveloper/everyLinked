import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
// Routers - SOC
// Clean Code
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postsRoute from "./routes/post.route.js";
dotenv.config();

// SINGLE TON
// Middle ware = Middle + Software

const app = express();
// parse JSON request body - JSOn으로 파싱 할 수 있게해줌
app.use(express.json());
// to check the cookie - 쿠키를 파싱 할 수 있게해줌
app.use(cookieParser());
// Version Control
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ${PORT}`);
  connectDB();
});

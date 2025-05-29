import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// Routers - SOC
// Clean Code
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postsRoute from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";

dotenv.config();

// SINGLE TON
// Middle ware = Middle + Software

const app = express();
// parse JSON request body - JSOn으로 파싱 할 수 있게해줌
// Set the max file volumn
// SET THE CORS --!
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "5mb" }));
// to check the cookie - 쿠키를 파싱 할 수 있게해줌
app.use(cookieParser());

// Version Control
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postsRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/connections", connectionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ${PORT}`);
  connectDB();
});

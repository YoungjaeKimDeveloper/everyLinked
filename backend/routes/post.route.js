import express, { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFeedPosts, createPost } from "../controllers/post.controller.js";
const router = express.Router();

// ProtectRoute -> Only Authenticated user
// fetch all posts
router.get("/", protectRoute, getFeedPosts);
// Cretae new post
router.post("/create", protectRoute, createPost);

export default router;

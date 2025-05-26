/*

  SOC 항상 나눠주기 - Route Setting

*/
import express from "express";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

// Auth Routes
// Signup,Login,Logout
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/logout", logout);

// Set the Middleware before call getCurrentUser
router.get("/me", protectRoute, getCurrentUser);

export default router;

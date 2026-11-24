import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPasswordController,
  changePasswordController,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";



const router = Router();

// Limit repeated login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPasswordController);
router.post("/change-password", authenticate, changePasswordController);

export default router;
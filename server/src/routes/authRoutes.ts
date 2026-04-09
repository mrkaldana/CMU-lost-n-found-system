import { Router } from "express";
import { adminLogin, login, register, requestPasswordResetOtp, resetPasswordWithOtp, updateProfile, verifyPasswordResetOtp } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/admin-login", adminLogin);
authRouter.post("/forgot-password/request-otp", requestPasswordResetOtp);
authRouter.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
authRouter.post("/forgot-password/reset", resetPasswordWithOtp);
authRouter.put("/profile", requireAuth, updateProfile);


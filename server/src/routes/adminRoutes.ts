import { Router } from "express";
import { adminGetDashboardStats, adminGetItems, adminUpdateItemStatus } from "../controllers/adminController";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get("/items", requireAuth, requireAdmin, adminGetItems);
adminRouter.get("/dashboard-stats", requireAuth, requireAdmin, adminGetDashboardStats);
adminRouter.put("/items/:id/status", requireAuth, requireAdmin, adminUpdateItemStatus);


import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { getAdminDashboardData } from "../controllers/adminDashboard.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getAdminDashboardData);

export default router;

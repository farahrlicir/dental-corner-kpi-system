import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { getMyMonthlyReportsController } from "../controllers/assistantReport.controller";

const router = Router();

router.use(authenticate, authorize("ASSISTANT"));

router.get("/my-reports", getMyMonthlyReportsController);

export default router;
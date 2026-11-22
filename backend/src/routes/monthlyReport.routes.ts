import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

import {
  getMonthlyReportsController,
  generateMonthlyReportsController,
  finalizeMonthlyReportController,
} from "../controllers/monthlyReport.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getMonthlyReportsController);
router.post("/generate", generateMonthlyReportsController);
router.post("/finalize", finalizeMonthlyReportController);

export default router;
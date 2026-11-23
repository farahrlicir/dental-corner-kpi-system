
import { Router } from "express";
import {
  getEvaluationForm,
  submitEvaluation,
  getEvaluationHistoryController,
  getPendingEvaluationsController,
  updateEvaluationController,
  approveEvaluationController,
  rejectEvaluationController,
} from "../controllers/evaluation.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

// Dentist routes
router.get("/form", authorize("DENTIST"), getEvaluationForm);
router.post("/", authorize("DENTIST"), submitEvaluation);

// Admin routes
router.get("/history", authorize("ADMIN"), getEvaluationHistoryController);
router.get("/admin/pending", authorize("ADMIN"), getPendingEvaluationsController);
router.put("/:evaluationId", authorize("ADMIN"), updateEvaluationController);
router.post("/:evaluationId/approve", authorize("ADMIN"), approveEvaluationController);
router.post("/:evaluationId/reject", authorize("ADMIN"), rejectEvaluationController);

export default router;

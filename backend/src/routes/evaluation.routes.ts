
import { Router } from "express";
import {
  getEvaluationForm,
  submitEvaluation,
  getEvaluationHistoryController,
} from "../controllers/evaluation.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/form",
  authorize("DENTIST"),
  getEvaluationForm
);

router.post(
  "/",
  authorize("DENTIST"),
  submitEvaluation
);

router.get(
  "/history",
  authorize("ADMIN"),
  getEvaluationHistoryController
);

export default router;

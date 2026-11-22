import { Router } from "express";
import {
  getConfigurations,
  createDraft,
  saveDraft,
  publishDraft,
} from "../controllers/adminKpi.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/configurations", getConfigurations);
router.post("/configurations/draft", createDraft);
router.put("/configurations/:id", saveDraft);
router.post("/configurations/:id/publish", publishDraft);

export default router;
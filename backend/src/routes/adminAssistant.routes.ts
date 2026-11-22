import { Router } from "express";

import {
  getAssistants,
  createAssistant,
  editAssistant,
  changeAssistantStatus,
} from "../controllers/adminAssistant.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getAssistants);
router.post("/", createAssistant);
router.patch("/:id", editAssistant);
router.patch("/:id/status", changeAssistantStatus);

export default router;
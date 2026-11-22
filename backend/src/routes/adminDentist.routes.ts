import { Router } from "express";

import {
  getDentists,
  changeDentistStatus,
} from "../controllers/adminDentist.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// All dentist management routes require an authenticated admin.
router.use(authenticate, authorize("ADMIN"));

router.get("/", getDentists);
router.patch("/:id/status", changeDentistStatus);

export default router;
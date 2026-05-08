import { Router } from "express";

import { InitController } from "../../controllers/init/init.controller";
import { authenticate } from "../../middlewares/auth/auth.middleware";
const router = Router();
router.get("/auth/init", authenticate, InitController.initController);

export default router;

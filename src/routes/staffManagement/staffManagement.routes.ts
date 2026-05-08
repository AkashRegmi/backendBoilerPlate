import { Router } from "express";
import { validateRequest } from "../../middlewares/validate/validateRequest.middleware";
import { staffManagementSchema } from "../../schemas/staffManagement/staffManagement.schemas";
import { staffManagementController } from "../../controllers/staffManagement/staffManagement.controller";
import { authenticate } from "../../middlewares/auth/auth.middleware";

const router = Router();
router.post(
  "/staff",
  validateRequest(staffManagementSchema),
  authenticate,
  staffManagementController.registerStaffController,
);
router.get(
  "/staff",
  authenticate,
  staffManagementController.getAllStaffControllerwithPagination,
);
router.get(
  "/staff/:id",
  authenticate,
  staffManagementController.getStaffByIdController,
);
router.put(
  "/staff/:id",
  authenticate,
  staffManagementController.updateStaffController,
);
router.delete(
  "/staff/:id",
  authenticate,
  staffManagementController.deleteStaffController,
);
router.get(
  "/export/staff",
  authenticate,
  staffManagementController.exportStaffExcelController,
);

export default router;

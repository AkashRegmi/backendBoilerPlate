import { z } from "zod";
import {
  staffManagementSchema,
  updateStaffManagementSchema,
} from "../../schemas/staffManagement/staffManagement.schemas";
export type registerStaffDTO = z.infer<typeof staffManagementSchema.body>;
export type updateStaffDTO = z.infer<typeof updateStaffManagementSchema.body>;

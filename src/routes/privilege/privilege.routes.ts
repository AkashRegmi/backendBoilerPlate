import { Router } from "express";
import {
  deletePrivilege,
  getAllSystemPrivileges,
  getPrivilegeByRole,
  updatePrivilege,
} from "../../controllers/privillage/privillage.controller";
import { verifyPrivilege } from "../../middlewares/privilege/privilege.middleware";
import { ROLEMAPPING_PRIVILEGES } from "../../utils/privileges";
const router = Router();
router.get(
  "/privileges/system/all",
  verifyPrivilege(ROLEMAPPING_PRIVILEGES.KEY, ROLEMAPPING_PRIVILEGES.READ),
  getAllSystemPrivileges,
);
router.get(
  "/privileges/:role",
  verifyPrivilege(ROLEMAPPING_PRIVILEGES.KEY, ROLEMAPPING_PRIVILEGES.READ),
  getPrivilegeByRole,
);
router.post(
  "/privileges/:role",
  verifyPrivilege(ROLEMAPPING_PRIVILEGES.KEY, ROLEMAPPING_PRIVILEGES.EDIT),
  updatePrivilege,
);
router.delete(
  "/privileges/:role",
  verifyPrivilege(ROLEMAPPING_PRIVILEGES.KEY, ROLEMAPPING_PRIVILEGES.EDIT),
  deletePrivilege,
);

export default router;

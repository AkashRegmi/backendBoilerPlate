import { NextFunction, Request, Response } from 'express'
import { UserRole } from '../../enums/user/user.enum'
import { STATUS_CODE } from '../../utils/constant'
import { AppError } from '../../utils/error'
import { PrivilegeRepository } from '../../repositories/privilege/privilege.repository'

export const verifyPrivilege = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user

      if (!user) {
        throw new AppError('Authentication required', STATUS_CODE.UNAUTHORIZED)
      }

      // 1. SUPER_ADMIN (role 7) has bypass access to everything
      if (user.role === UserRole.SUPER_ADMIN) {
        return next()
      }

      // 2. Fetch all privileges assigned to the user's role
      const rolePrivileges = await PrivilegeRepository.findPrivilegeByRole(
        user.role,
      )

      if (
        !rolePrivileges ||
        !rolePrivileges.privileges ||
        rolePrivileges.privileges.length === 0
      ) {
        throw new AppError(
          'No privileges assigned to this role. Please contact administrator.',
          STATUS_CODE.FORBIDDEN,
        )
      }

      // 3. Find the specific module within the role's privileges
      const modulePrivilege = rolePrivileges.privileges.find(
        (p) => p.module.toLowerCase() === module.toLowerCase(),
      )

      if (!modulePrivilege) {
        throw new AppError(
          `Access Denied: Your role does not have access to the '${module}' module.`,
          STATUS_CODE.FORBIDDEN,
        )
      }

      // 4. Check if the specific action is permitted for this module
      const hasAction = modulePrivilege.actions.some((a: any) => {
        // Handle both string array and object array (IAction interface)
        const actionType = typeof a === 'string' ? a : a.type
        return actionType.toLowerCase() === action.toLowerCase()
      })

      if (!hasAction) {
        throw new AppError(
          `Access Denied: You do not have '${action}' permission on '${module}' module.`,
          STATUS_CODE.FORBIDDEN,
        )
      }

      // Everything checks out
      next()
    } catch (error) {
      next(error)
    }
  }
}

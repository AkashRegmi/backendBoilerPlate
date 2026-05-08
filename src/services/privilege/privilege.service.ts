import { IPrivilege } from '../../interfaces/privilege/privilege.interface'
import { PrivilegeRepository } from '../../repositories/privilege/privilege.repository'
import { ALL_PRIVILEGES } from '../../utils/privileges'

export class PrivilegeService {
  static async getPrivileges(role: number) {
    return await PrivilegeRepository.findPrivilegeByRole(role)
  }

  static async upsertPrivileges(role: number, privileges: IPrivilege[]) {
    return await PrivilegeRepository.createOrUpdatePrivilege(role, privileges)
  }

  static async deletePrivileges(role: number) {
    return await PrivilegeRepository.deletePrivilegeByRole(role)
  }

  static getAllSystemPrivileges() {
    return ALL_PRIVILEGES
  }
}

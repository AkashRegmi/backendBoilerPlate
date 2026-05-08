import { IPrivilege } from '../../interfaces/privilege/privilege.interface'
import PrivilegeManagement from '../../models/privilege/privilege.model'

export class PrivilegeRepository {
  static async findPrivilegeByRole(role: number) {
    return await PrivilegeManagement.findOne({ role })
  }

  static async createOrUpdatePrivilege(role: number, privileges: IPrivilege[]) {
    return await PrivilegeManagement.findOneAndUpdate(
      { role },
      { role, privileges },
      { new: true, upsert: true },
    )
  }

  static async deletePrivilegeByRole(role: number) {
    return await PrivilegeManagement.findOneAndDelete({ role })
  }
}

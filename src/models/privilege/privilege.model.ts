import mongoose, { Schema } from 'mongoose'
import { UserRole } from '../../enums/user/user.enum'
import { NepalDateUtils } from '../../utils/date-utils'
import { IPrivilegeManagement } from '../../interfaces/privilege/privilege.interface'
const privilegeManagementSchema: Schema<IPrivilegeManagement> = new Schema({
  role: {
    type: Number,
    enum: UserRole,
    required: true,
    unique: true,
  },
  privileges: [
    {
      module: {
        type: String,
        required: true,
      },
      actions: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  createdAt: { type: Date, default: NepalDateUtils.toMongoDBUTC() },
  updatedAt: { type: Date, default: NepalDateUtils.toMongoDBUTC() },
})

privilegeManagementSchema.index({ role: 1 }, { unique: true })

const PrivilegeManagement = mongoose.model<IPrivilegeManagement>(
  'PrivilegeManagement',
  privilegeManagementSchema,
)

export default PrivilegeManagement

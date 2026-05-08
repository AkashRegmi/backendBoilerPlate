import { Document, Types } from 'mongoose'
import { UserRole } from '../../enums/user/user.enum'


export interface INotificationData {
  eventName: string
  recipient: Types.ObjectId | string
  recipientRole: UserRole
  message: string
  isRead?: boolean
  sourceId?: Types.ObjectId | string
  readAt?: Date,
  createdAt?: Date
  updatedAt?: Date
}

export interface INotification extends INotificationData, Document {}

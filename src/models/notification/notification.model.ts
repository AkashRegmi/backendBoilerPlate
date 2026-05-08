import { Schema, model } from 'mongoose'
import { INotification } from '../../interfaces/notification/notification.interface'
import { UserRole } from '../../enums/user/user.enum'


const notificationSchema = new Schema<INotification>(
  {
    eventName: {
      type: String,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientRole: {
      type: Number,
      enum: UserRole,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

export const NotificationModel = model<INotification>(
  'Notification',
  notificationSchema,
)

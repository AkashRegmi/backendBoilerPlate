import { Types } from 'mongoose'
import { io } from '../../configs/socket.config'
import { UserRole } from '../../enums/user/user.enum'
import { INotificationData } from '../../interfaces/notification/notification.interface'
import { NotificationModel } from '../../models/notification/notification.model'
import { User } from '../../models/user/user.model'

export class NotificationService {
  static async sendNotification(data: INotificationData) {
    const notification = await NotificationModel.create({
      ...data,
      recipient: new Types.ObjectId(data.recipient),
      sourceId: data.sourceId ? new Types.ObjectId(data.sourceId) : undefined,
    })

    // Emit to specific user room
    io.to(data.recipient.toString()).emit(data.eventName, notification)

    return notification
  }

  static async sendToRole(
    role: UserRole,
    data: Omit<INotificationData, 'recipient' | 'recipientRole'>,
  ) {
    // Save notifications for all users of that role
    const users = await User.find({ role })

    const notifications = await NotificationModel.insertMany(
      users.map((user) => ({
        ...data,
        recipient: user._id,
        recipientRole: role,
      })),
    )

    // Emit real-time to role room
    io.to(`role_${role}`).emit('new_notification', data)

    return notifications
  }
  static async getUserNotifications(
    userId: string,
    page: number,
    limit: number,
    isRead?: boolean,
  ) {
    const skip = (page - 1) * limit
    const query: any = { recipient: userId }


    if (isRead !== undefined && isRead !== null) {
      query.isRead = isRead
    }
    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({ recipient: userId, isRead: false }),
    ])

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async markOneAsRead(notificationId: string, userId: string) {
    return NotificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId, // security check
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    )
  }

  static async markAllAsRead(userId: string) {
    const result = await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    )
    return result.modifiedCount > 0
  }

  static async deleteOldNotifications() {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const result = await NotificationModel.deleteMany({
      createdAt: { $lt: oneMonthAgo },
    })

    console.log(`[Cron] Deleted ${result.deletedCount} old notifications`)
    return result
  }
}

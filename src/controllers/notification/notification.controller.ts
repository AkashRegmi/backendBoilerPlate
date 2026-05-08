import { Request, Response } from 'express'
import { NotificationService } from '../../services/notification/notification.service'
import { asyncHandler } from '../../utils/asyncHandler'
import { STATUS_CODE } from '../../utils/constant'
import { sendResponse } from '../../utils/response'

// GET /api/notifications — paginated list for the logged-in user
const getUserNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const isRead = req.query.isRead !== undefined ? Boolean(Number(req.query.isRead)) : undefined


    const result = await NotificationService.getUserNotifications(
      userId,
      page,
      limit,
      isRead,
    )

    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
      },
      pagination: {
        page: result.page,
        limit,
        totalItems: result.total,
        totalPages: result.totalPages,
      },
    })
  },
)

// PATCH /api/notifications/:id/read — mark a single notification as read (own only)
const markOneAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params

  const updated = await NotificationService.markOneAsRead(id.toString(), userId)

  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: updated
      ? 'Notification marked as read'
      : 'Notification not found or already read',
    data: updated,
  })
})

// PATCH /api/notifications/read-all — mark all unread notifications as read for current user
const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id

  const updated = await NotificationService.markAllAsRead(userId)

  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: updated
      ? 'All notifications marked as read'
      : 'No unread notifications found',
    data: updated,
  })
})

export const NotificationController = {
  getUserNotifications,
  markOneAsRead,
  markAllAsRead,
}

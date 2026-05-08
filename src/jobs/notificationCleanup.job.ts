import cron from 'node-cron'
import { NotificationService } from '../services/notification/notification.service'

/**
 * Initializes the cron job to delete notifications older than 1 month.
 * Runs every day at midnight.
 */
export const initNotificationCleanupJob = () => {
  // '0 0 * * *' = midnight every day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily notification cleanup...')
      await NotificationService.deleteOldNotifications()
    } catch (error) {
      console.error('[Cron Error] Failed to delete old notifications:', error)
    }
  })
}

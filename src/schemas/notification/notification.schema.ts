import { z } from 'zod'

export const sendNotificationSchema = z.object({
  recipient: z.string("Recipient is required"),
  recipientRole: z.number("Recipient role is required"),
  message: z.string("Message is required").min(1),
  sourceId: z.string().optional(),
  
})

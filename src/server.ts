import { env } from 'node:process'
import http from 'http'
import app from './app'
import { connectDB } from './configs/db.config'
import { verifyEmailConnection } from './configs/email.config'
import { initSocket } from './configs/socket.config'
import { initNotificationCleanupJob } from './jobs/notificationCleanup.job'

const startServer = async () => {
  await connectDB()
  await verifyEmailConnection()

  const server = http.createServer(app)

  initSocket(server)
  initNotificationCleanupJob()

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
  })
}

startServer()

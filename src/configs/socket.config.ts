import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'
import { socketAuthMiddleware } from '../middlewares/socket/socket.middleware';

export let io: Server

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Use middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(socket.data);
    const user = socket.data.user; // from verified JWT
    const userId = user.id;
    const role = user.role;

    // Join personal room
    socket.join(userId);

    // Join role room
    socket.join(`role_${role}`);

    console.log(`User ${userId} joined role_${role}`);
  });
};

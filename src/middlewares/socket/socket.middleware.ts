// src/middleware/socket.middleware.ts
import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../../configs/env.config';


export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
  try {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const secret = env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    const decoded = jwt.verify(token as string, secret) as JwtPayload;

    // Attach user info to socket.data for later use
    socket.data.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    console.error('Socket authentication failed:', err.message);
    next(new Error('Authentication error'));
  }
};

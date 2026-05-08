import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { STATUS_CODE } from '../../utils/constant'
import { AppError } from '../../utils/error'
import { JwtPayload } from '../../interfaces/jwt/jwt.interface'
import { env } from '../../configs/env.config'


export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader)
      throw new AppError(
        'Authorization header missing',
        STATUS_CODE.UNAUTHORIZED,
      )

    const token = authHeader.split(' ')[1]

    if (!token)
      throw new AppError('Bearer token missing', STATUS_CODE.UNAUTHORIZED)

    const secret = env.JWT_ACCESS_SECRET

    if (!secret)
      throw new AppError(
        'JWT secret not configured',
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      )

    const decoded = jwt.verify(token, secret) as JwtPayload

    req.user = decoded


    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        'Unauthorized: ' +
        (error instanceof Error ? error.message : 'Invalid token'),
    })
  }
}

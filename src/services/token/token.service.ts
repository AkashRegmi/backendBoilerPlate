import jwt from 'jsonwebtoken'
import { env } from '../../configs/env.config'
import { TokenPayload, Tokens } from '../../interfaces/token/token.interface'

export const generateToken = (tokenPayload: TokenPayload): Tokens => {
  if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined')
  }
  const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions)
  const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions)
  return {
    accessToken,
    refreshToken,
  }
}

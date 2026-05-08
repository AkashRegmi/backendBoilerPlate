// types/express/index.d.ts
import { UserRole } from '../../enums/user/user.enum'

interface JwtPayload {
  id: string
  role: UserRole
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

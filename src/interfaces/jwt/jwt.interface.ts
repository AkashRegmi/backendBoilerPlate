import { UserRole } from "../../enums/user/user.enum"


export interface JwtPayload {
  id: string
  role: UserRole
  email: string
}

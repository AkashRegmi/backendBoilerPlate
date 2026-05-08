import { UserRole } from '../../enums/user/user.enum'

interface TokenPayload {
  id: string
  email: string
  role: UserRole
  name: string
}
// interface TokenPayload {
//   user: UserTokenPayload;
// }
interface Tokens {
  accessToken: string
  refreshToken: string
}
export { TokenPayload, Tokens }

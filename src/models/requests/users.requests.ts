import { UserRole } from '~/constants/enum'

export type RegisterReqBody = {
  username: string
  password: string
  role: UserRole
}

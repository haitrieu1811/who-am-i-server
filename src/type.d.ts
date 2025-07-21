import 'express'

import Player from '~/models/databases/Player'
import User from '~/models/databases/User'
import { TokenPayload } from '~/models/requests/users.requests'

declare module 'express' {
  interface Request {
    decodedAuthorization?: TokenPayload
    decodedRefreshToken?: TokenPayload
    decodedVerifyEmailToken?: TokenPayload
    decodedForgotPasswordToken?: TokenPayload
    user?: User
    player?: Player
  }
}

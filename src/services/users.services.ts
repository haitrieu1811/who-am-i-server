import omit from 'lodash/omit'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { RefreshToken } from '~/models/databases/RefreshToken'
import User, { TokenPayload } from '~/models/databases/User'
import { RegisterReqBody } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'

class UsersService {
  // Tạo access token
  async signAccessToken(payload: TokenPayload) {
    return signToken({
      payload,
      privateKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo refresh token
  async signRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          ...payload,
          exp
        },
        privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
      })
    }
    return signToken({
      payload,
      privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo access và refresh token
  async signAccessAndRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
    return Promise.all([this.signAccessToken(payload), this.signRefreshToken({ exp, ...payload })])
  }

  // Giải mã refresh token
  async decodedRefreshToken(refreshToken: string) {
    const tokenPayload = await verifyToken({
      token: refreshToken,
      secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
    })
    return tokenPayload
  }

  // Đăng ký tài khoản
  async register(body: RegisterReqBody) {
    const { insertedId } = await databaseService.users.insertOne(
      new User({ ...body, password: hashPassword(body.password) })
    )
    const user = (await databaseService.users.findOne({
      _id: insertedId
    })) as WithId<User>
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: user._id.toString(),
      userRole: user.role
    })
    return {
      accessToken,
      refreshToken,
      user
    }
  }

  // Đăng nhập
  async login(user: User) {
    const { _id, role } = user
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: _id.toString(),
      userRole: role
    })
    return {
      accessToken,
      refreshToken,
      user: omit(user, ['password'])
    }
  }

  // Refresh token
  async refreshToken({
    refreshToken,
    decodedRefreshToken
  }: {
    refreshToken: string
    decodedRefreshToken: TokenPayload & { exp: number }
  }) {
    const { userId, userRole, exp } = decodedRefreshToken
    // Tạo tokens mới
    const [newAcessToken, newRefreshToken] = await this.signAccessAndRefreshToken({
      userId,
      userRole,
      exp
    })
    // Giải mã refresh token mới
    const decodedNewRefreshToken = await this.decodedRefreshToken(newRefreshToken)
    await Promise.all([
      // Thêm refresh token mới vào DB
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          userId: new ObjectId(decodedNewRefreshToken.userId),
          token: newRefreshToken,
          iat: decodedNewRefreshToken.iat,
          exp: decodedNewRefreshToken.exp
        })
      ),
      // Xóa refresh token cũ
      await databaseService.refreshTokens.deleteOne({
        token: refreshToken
      })
    ])
    return {
      accessToken: newAcessToken,
      refreshToken: newRefreshToken
    }
  }
}

const usersService = new UsersService()
export default usersService

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import User, { TokenPayload } from '~/models/databases/User'
import { RefreshTokenReqBody, RegisterReqBody } from '~/models/requests/users.requests'
import usersService from '~/services/users.services'

// Đăng ký
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: 'Đăng ký tài khoản thành công.',
    data: result
  })
}

// Đăng nhập
export const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.user as User)
  res.json({
    message: 'Đăng nhập thành công',
    data: result
  })
}

// Refresh token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const result = await usersService.refreshToken({
    refreshToken: req.body.refreshToken,
    decodedRefreshToken: req.decodedRefreshToken as TokenPayload & { exp: number }
  })
  res.json({
    message: 'Refresh token thành công.',
    data: result
  })
}

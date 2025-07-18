import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'

import { ENV_CONFIG } from '~/constants/config'
import { UserRole } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { numberEnumToArray } from '~/utils/helpers'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const userRoles = numberEnumToArray(UserRole)

const passwordSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Mật khẩu là bắt buộc.'
  },
  isLength: {
    options: {
      min: 8,
      max: 32
    },
    errorMessage: 'Mật khẩu phải dài từ 8 đến 32 ký tự.'
  }
}

const confirmPasswordSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Nhập lại mật khẩu là bắt buộc.'
  },
  custom: {
    options: (value: string, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Nhập lại mật khẩu không chính xác.')
      }
      return true
    }
  }
}

const usernameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Tên đăng nhập là bắt buộc.'
  },
  isLength: {
    options: {
      min: 8,
      max: 32
    },
    errorMessage: 'Tên đăng nhập phải dài từ 8 đến 32 ký tự.'
  }
}

// Đăng ký tài khoản
export const registerValidator = validate(
  checkSchema(
    {
      username: {
        ...usernameSchema,
        custom: {
          options: async (value) => {
            const user = await databaseService.users.findOne({
              username: value
            })
            if (user) {
              throw new Error('Tên đăng nhập đã tồn tại.')
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      role: {
        notEmpty: {
          errorMessage: 'Vai trò người dùng là bắt buộc.'
        },
        isIn: {
          options: [userRoles],
          errorMessage: 'Vai trò người dùng không hợp lệ.'
        }
      }
    },
    ['body']
  )
)

// Đăng nhập
export const loginValidator = validate(
  checkSchema(
    {
      username: usernameSchema,
      password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: req.body.email,
              password: hashPassword(value)
            })
            if (!user) {
              throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác')
            }
            ;(req as Request).user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh token là bắt buộc.',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [refreshToken, decodedRefreshToken] = await Promise.all([
                databaseService.refreshTokens.findOne({ token: value }),
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
                })
              ])
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: 'Refresh token không tồn tại.',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decodedRefreshToken = decodedRefreshToken
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const accessToken = value?.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: 'Access token là bắt buộc.',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decodedAuthorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN
              })
              ;(req as Request).decodedAuthorization = decodedAuthorization
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['headers']
  )
)

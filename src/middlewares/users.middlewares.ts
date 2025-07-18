import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'

import { UserRole } from '~/constants/enum'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { numberEnumToArray } from '~/utils/helpers'
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

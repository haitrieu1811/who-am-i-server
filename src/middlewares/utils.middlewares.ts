import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'

export const mongoIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: (value) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Mongo ID là bắt buộc.'
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Mongo ID không hợp lệ.'
        })
      }
      return true
    }
  }
}

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: 'Page phải là một số nguyên.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value <= 0) {
              throw new ErrorWithStatus({
                message: 'Page phải lớn hơn 0.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      limit: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: 'Limit phải là một số nguyên.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value < 0) {
              throw new ErrorWithStatus({
                message: 'Limit phải lớn hơn hoặc bằng 0.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

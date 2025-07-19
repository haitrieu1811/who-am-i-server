import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { mongoIdSchema } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const nationIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'ID quốc gia là bắt buộc.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'ID quốc gia không hợp lệ.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const nation = await databaseService.nations.findOne({
        _id: new ObjectId(value)
      })
      if (!nation) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy quốc gia.',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const createNationValidator = validate(
  checkSchema(
    {
      flag: mongoIdSchema,
      name: {
        trim: true,
        notEmpty: {
          errorMessage: 'Tên quốc gia là bắt buộc.'
        }
      }
    },
    ['body']
  )
)

export const nationIdValidator = validate(
  checkSchema(
    {
      nationId: nationIdSchema
    },
    ['params']
  )
)

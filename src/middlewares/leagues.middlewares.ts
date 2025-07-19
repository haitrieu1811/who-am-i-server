import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { mongoIdSchema } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const leagueIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'ID giải đấu là bắt buộc.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'ID giải đấu không hợp lệ.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const league = await databaseService.leagues.findOne({
        _id: new ObjectId(value)
      })
      if (!league) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy giải đấu.',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const createLeagueValidator = validate(
  checkSchema(
    {
      logo: mongoIdSchema,
      name: {
        trim: true,
        notEmpty: {
          errorMessage: 'Tên giải đấu là bắt buộc.'
        }
      }
    },
    ['body']
  )
)

export const leagueIdValidator = validate(
  checkSchema(
    {
      leagueId: leagueIdSchema
    },
    ['params']
  )
)

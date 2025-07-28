import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { leagueIdSchema } from '~/middlewares/leagues.middlewares'

import { mongoIdSchema } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const teamIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'ID đội bóng là bắt buộc.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'ID đội bóng không hợp lệ.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const team = await databaseService.teams.findOne({
        _id: new ObjectId(value)
      })
      if (!team) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy đội bóng.',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const createTeamValidator = validate(
  checkSchema(
    {
      logo: mongoIdSchema,
      name: {
        trim: true,
        notEmpty: {
          errorMessage: 'Tên đội bóng là bắt buộc.'
        }
      },
      leagueId: leagueIdSchema
    },
    ['body']
  )
)

export const teamIdValidator = validate(
  checkSchema(
    {
      teamId: teamIdSchema
    },
    ['params']
  )
)

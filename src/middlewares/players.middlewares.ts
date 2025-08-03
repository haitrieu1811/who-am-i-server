import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { PlayerPosition } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { leagueIdSchema } from '~/middlewares/leagues.middlewares'
import { nationIdSchema } from '~/middlewares/nations.middlewares'
import { teamIdSchema } from '~/middlewares/teams.middlewares'
import { mongoIdSchema } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const positions = numberEnumToArray(PlayerPosition)

export const playerIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: 'ID cầu thủ là bắt buộc.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'ID cầu thủ không hợp lệ.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const player = await databaseService.players.findOne({
        _id: new ObjectId(value)
      })
      if (!player) {
        throw new ErrorWithStatus({
          message: 'Không tìm thấy cầu thủ.',
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      ;(req as Request).player = player
      return true
    }
  }
}

export const createPlayerValidator = validate(
  checkSchema(
    {
      nationId: nationIdSchema,
      leagueId: leagueIdSchema,
      teamId: teamIdSchema,
      avatar: {
        ...mongoIdSchema,
        optional: true
      },
      name: {
        trim: true,
        notEmpty: {
          errorMessage: 'Tên cầu thủ là bắt buộc.'
        }
      },
      dateOfBirth: {
        notEmpty: {
          errorMessage: 'Ngày sinh cầu thủ là bắt buộc.'
        },
        isISO8601: {
          errorMessage: 'Ngày sinh cầu thủ không hợp lệ.'
        }
      },
      shirtNumber: {
        custom: {
          options: (value) => {
            if (value === undefined) {
              throw new Error('Số áo cầu thủ là bắt buộc.')
            }
            if (!Number.isInteger(value)) {
              throw new Error('Số áo cầu thủ phải là một số nguyên.')
            }
            if (value <= 0 || value > 99) {
              throw new Error('Số áo cầu thủ phải là từ 1 đến 99.')
            }
            return true
          }
        }
      },
      position: {
        notEmpty: {
          errorMessage: 'Vị trí cầu thủ là bắt buộc.'
        },
        isIn: {
          options: [positions],
          errorMessage: 'Vị trí cầu thủ không hợp lệ.'
        }
      }
    },
    ['body']
  )
)

export const playerIdValidator = validate(
  checkSchema(
    {
      playerId: playerIdSchema
    },
    ['params']
  )
)

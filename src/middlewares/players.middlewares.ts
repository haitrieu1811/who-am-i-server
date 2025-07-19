import { checkSchema } from 'express-validator'

import { PlayerPosition } from '~/constants/enum'
import { leagueIdSchema } from '~/middlewares/leagues.middlewares'
import { nationIdSchema } from '~/middlewares/nations.middlewares'
import { teamIdSchema } from '~/middlewares/teams.middlewares'
import { mongoIdSchema } from '~/middlewares/utils.middlewares'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const positions = numberEnumToArray(PlayerPosition)

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
      // dateOfBirth: {
      //   notEmpty: {
      //     errorMessage: 'Ngày sinh cầu thủ là bắt buộc.'
      //   },
      //   isDate: {
      //     errorMessage: 'Ngày sinh cầu thủ không hợp lệ.'
      //   }
      // },
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

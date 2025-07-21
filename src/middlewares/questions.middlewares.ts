import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { QuestionLevel } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { playerIdSchema } from '~/middlewares/players.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const levels = numberEnumToArray(QuestionLevel)

export const createQuestionValidator = validate(
  checkSchema(
    {
      answerId: playerIdSchema,
      level: {
        notEmpty: {
          errorMessage: 'Cấp độ câu hỏi là bắt buộc.'
        },
        isIn: {
          options: [levels],
          errorMessage: 'Cấp độ câu hỏi không hợp lệ.'
        }
      }
    },
    ['body']
  )
)

export const questionDoesNotExistBeforeValidator = async (req: Request, res: Response, next: NextFunction) => {
  const question = await databaseService.questions.findOne({
    answerId: req.player?._id
  })
  if (question) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Câu hỏi về câu hỏi này đã tồn tại.'
      })
    )
  }
  next()
}

export const questionIdValidator = validate(
  checkSchema(
    {
      questionId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'ID câu hỏi là bắt buộc.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'ID câu hỏi không hợp lệ.',
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const question = await databaseService.questions.findOne({
              _id: new ObjectId(value)
            })
            if (!question) {
              throw new ErrorWithStatus({
                message: 'Không tìm thấy câu hỏi.',
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

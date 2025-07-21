import { Router } from 'express'

import {
  createQuestionController,
  getQuestionController,
  updateQuestionController
} from '~/controllers/questions.controllers'
import {
  createQuestionValidator,
  questionDoesNotExistBeforeValidator,
  questionIdValidator
} from '~/middlewares/questions.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const questionsRouter = Router()

questionsRouter.post(
  '/',
  accessTokenValidator,
  isAdminValidator,
  createQuestionValidator,
  questionDoesNotExistBeforeValidator,
  createQuestionController
)

questionsRouter.put(
  '/:questionId',
  accessTokenValidator,
  isAdminValidator,
  questionIdValidator,
  createQuestionValidator,
  updateQuestionController
)

questionsRouter.get('/level/:level', getQuestionController)

export default questionsRouter

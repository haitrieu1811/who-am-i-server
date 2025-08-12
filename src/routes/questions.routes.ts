import { Router } from 'express'

import {
  createQuestionController,
  deleteQuestionController,
  getQuestionByIdController,
  getQuestionsController,
  getRandomQuestionController,
  updateQuestionController
} from '~/controllers/questions.controllers'
import {
  createQuestionValidator,
  questionDoesNotExistBeforeValidator,
  questionIdValidator
} from '~/middlewares/questions.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

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

questionsRouter.get('/random', getRandomQuestionController)

questionsRouter.get(
  '/:questionId',
  accessTokenValidator,
  isAdminValidator,
  questionIdValidator,
  getQuestionByIdController
)

questionsRouter.delete(
  '/:questionId',
  accessTokenValidator,
  isAdminValidator,
  questionIdValidator,
  deleteQuestionController
)

questionsRouter.get('/', accessTokenValidator, isAdminValidator, paginationValidator, getQuestionsController)

export default questionsRouter

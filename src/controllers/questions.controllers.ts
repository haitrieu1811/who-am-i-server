import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CreateQuestionReqBody, LevelReqParams, QuestionIdReqParams } from '~/models/requests/questions.requests'
import questionsService from '~/services/questions.services'

export const createQuestionController = async (
  req: Request<ParamsDictionary, any, CreateQuestionReqBody>,
  res: Response
) => {
  const result = await questionsService.insertOne(req.body)
  res.json({
    message: 'Tạo câu hỏi thành công.',
    data: result
  })
}

export const updateQuestionController = async (
  req: Request<QuestionIdReqParams, any, CreateQuestionReqBody>,
  res: Response
) => {
  const result = await questionsService.updateOne({
    body: req.body,
    questionId: new ObjectId(req.params.questionId)
  })
  res.json({
    message: 'Cập nhật câu hỏi thành công.',
    data: result
  })
}

export const getQuestionController = async (req: Request<LevelReqParams>, res: Response) => {
  const result = await questionsService.findOne(Number(req.params.level))
  res.json({
    message: 'Lấy câu hỏi thành công.',
    data: result
  })
}

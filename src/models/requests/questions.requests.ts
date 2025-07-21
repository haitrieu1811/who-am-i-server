import { QuestionLevel } from '~/constants/enum'

export type CreateQuestionReqBody = {
  answerId: string
  level: QuestionLevel
}

export type QuestionIdReqParams = {
  questionId: string
}

export type LevelReqParams = {
  level: string
}

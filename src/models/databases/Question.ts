import { ObjectId } from 'mongodb'

import { QuestionLevel } from '~/constants/enum'

export type QuestionConstructor = {
  _id?: ObjectId
  answerId: ObjectId // ID cầu thủ
  level: QuestionLevel
  createdAt?: Date
  updatedAt?: Date
}

export default class Question {
  _id: ObjectId
  answerId: ObjectId // ID cầu thủ
  level: QuestionLevel
  createdAt: Date
  updatedAt: Date

  constructor({ _id, answerId, level, createdAt, updatedAt }: QuestionConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.answerId = answerId
    this.level = level
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

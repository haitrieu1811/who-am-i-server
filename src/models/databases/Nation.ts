import { ObjectId } from 'mongodb'

type NationConstructor = {
  _id?: ObjectId
  flag: ObjectId
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Nation {
  _id: ObjectId
  flag: ObjectId
  name: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, flag, name, createdAt, updatedAt }: NationConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.flag = flag
    this.name = name
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

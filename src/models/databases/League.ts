import { ObjectId } from 'mongodb'

type LeagueConstructor = {
  _id?: ObjectId
  logo: ObjectId
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export default class League {
  _id: ObjectId
  logo: ObjectId
  name: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, logo, name, createdAt, updatedAt }: LeagueConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.logo = logo
    this.name = name
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

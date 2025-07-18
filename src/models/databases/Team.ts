import { ObjectId } from 'mongodb'

type TeamConstructor = {
  _id?: ObjectId
  logo: ObjectId
  leagueId: ObjectId
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Team {
  _id: ObjectId
  logo: ObjectId
  leagueId: ObjectId
  name: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, logo, leagueId, name, createdAt, updatedAt }: TeamConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.logo = logo
    this.leagueId = leagueId
    this.name = name
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

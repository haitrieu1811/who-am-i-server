import { ObjectId } from 'mongodb'

import { PlayerPosition } from '~/constants/enum'

export type PlayerConstructor = {
  _id?: ObjectId
  nationId: ObjectId
  leagueId: ObjectId
  teamId: ObjectId
  avatar?: ObjectId
  name: string
  shirtNumber: number
  position: PlayerPosition
  dateOfBirth: Date
  createdAt?: Date
  updatedAt?: Date
}

export default class Player {
  _id: ObjectId
  nationId: ObjectId
  leagueId: ObjectId
  teamId: ObjectId
  avatar: ObjectId | null
  name: string
  shirtNumber: number
  position: PlayerPosition
  dateOfBirth: Date
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    nationId,
    leagueId,
    teamId,
    avatar,
    name,
    dateOfBirth,
    shirtNumber,
    position,
    createdAt,
    updatedAt
  }: PlayerConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.nationId = nationId
    this.leagueId = leagueId
    this.teamId = teamId
    this.avatar = avatar ?? null
    this.name = name
    this.shirtNumber = shirtNumber
    this.position = position
    this.dateOfBirth = dateOfBirth
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

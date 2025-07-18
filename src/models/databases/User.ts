import { ObjectId } from 'mongodb'

import { UserRole } from '~/constants/enum'

export type TokenPayload = {
  userId: string
  userRole: UserRole
}

type UserConstructor = {
  _id?: ObjectId
  username: string
  password: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

export default class User {
  _id: ObjectId
  username: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date

  constructor({ _id, username, password, role, createdAt, updatedAt }: UserConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.username = username
    this.password = password
    this.role = role
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

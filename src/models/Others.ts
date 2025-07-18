import { ObjectId } from 'mongodb'

export type MediaUploadRes = {
  _id: ObjectId
  name: string
  url: string
}

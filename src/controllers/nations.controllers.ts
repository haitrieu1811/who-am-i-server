import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CreateNationReqBody, NationIdReqParams } from '~/models/requests/nations.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import nationsService from '~/services/nations.services'

export const createNationController = async (
  req: Request<ParamsDictionary, any, CreateNationReqBody>,
  res: Response
) => {
  const result = await nationsService.insertOne(req.body)
  res.json({
    message: 'Tạo quốc gia thành công.',
    data: result
  })
}

export const getNationsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { nations, ...pagination } = await nationsService.findMany(req.query)
  res.json({
    message: 'Lấy danh sách quốc gia thành công.',
    data: {
      nations,
      pagination
    }
  })
}

export const updateNationController = async (
  req: Request<NationIdReqParams, any, CreateNationReqBody>,
  res: Response
) => {
  const result = await nationsService.updateOne({
    body: req.body,
    nationId: new ObjectId(req.params.nationId)
  })
  res.json({
    message: 'Cập nhật quốc gia thành công.',
    data: result
  })
}

export const deleteNationController = async (req: Request<NationIdReqParams>, res: Response) => {
  await nationsService.deleteOne(new ObjectId(req.params.nationId))
  res.json({
    message: 'Xóa quốc gia thành công.'
  })
}

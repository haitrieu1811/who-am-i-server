/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CreateLeagueReqBody, LeagueIdReqParams } from '~/models/requests/leagues.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import leaguesService from '~/services/leagues.services'

export const createLeagueController = async (
  req: Request<ParamsDictionary, any, CreateLeagueReqBody>,
  res: Response
) => {
  const result = await leaguesService.insertOne(req.body)
  res.json({
    message: 'Tạo giải đấu thành công.',
    data: result
  })
}

export const getLeaguesController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { leagues, ...pagination } = await leaguesService.findMany(req.query)
  res.json({
    message: 'Lấy danh sách giải đấu thành công.',
    data: {
      leagues,
      pagination
    }
  })
}

export const updateLeagueController = async (
  req: Request<LeagueIdReqParams, any, CreateLeagueReqBody>,
  res: Response
) => {
  const result = await leaguesService.updateOne({
    body: req.body,
    leagueId: new ObjectId(req.params.leagueId)
  })
  res.json({
    message: 'Cập nhật giải đấu thành công.',
    data: result
  })
}

export const deleteLeagueController = async (req: Request<LeagueIdReqParams>, res: Response) => {
  await leaguesService.deleteOne(new ObjectId(req.params.leagueId))
  res.json({
    message: 'Xóa giải đấu thành công.'
  })
}

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CreatePlayerReqBody, GetPlayersReqQuery, PlayerIdReqParams } from '~/models/requests/players.requests'
import playersService from '~/services/players.services'

export const createPlayerController = async (
  req: Request<ParamsDictionary, any, CreatePlayerReqBody>,
  res: Response
) => {
  const result = await playersService.insertOne(req.body)
  res.json({
    message: 'Tạo cầu thủ thành công.',
    data: result
  })
}

export const getPlayersController = async (
  req: Request<ParamsDictionary, any, any, GetPlayersReqQuery>,
  res: Response
) => {
  const { players, ...pagination } = await playersService.findMany(req.query)
  res.json({
    message: 'Lấy danh sách cầu thủ thành công.',
    data: {
      players,
      pagination
    }
  })
}

export const getPlayerController = async (req: Request<PlayerIdReqParams>, res: Response) => {
  const result = await playersService.findOne(new ObjectId(req.params.playerId))
  res.json({
    message: 'Lấy thông tin cầu thủ thành công.',
    data: result
  })
}

export const updatePlayerController = async (
  req: Request<PlayerIdReqParams, any, CreatePlayerReqBody>,
  res: Response
) => {
  const result = await playersService.updateOne({
    body: req.body,
    playerId: new ObjectId(req.params.playerId)
  })
  res.json({
    message: 'Cập nhật cầu thủ thành công.',
    data: result
  })
}

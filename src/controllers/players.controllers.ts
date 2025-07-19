import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { CreatePlayerReqBody } from '~/models/requests/players.requests'
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

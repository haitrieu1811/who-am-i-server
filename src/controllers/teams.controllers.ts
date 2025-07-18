import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { LeagueIdReqParams } from '~/models/requests/leagues.requests'
import { CreateTeamReqBody, TeamIdReqParams } from '~/models/requests/teams.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import teamsService from '~/services/teams.services'

export const createTeamController = async (req: Request<LeagueIdReqParams, any, CreateTeamReqBody>, res: Response) => {
  const result = await teamsService.insertOne({
    body: req.body,
    leagueId: new ObjectId(req.params.leagueId)
  })
  res.json({
    message: 'Tạo đội bóng thành công.',
    data: result
  })
}

export const getTeamsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { teams, ...pagination } = await teamsService.findMany(req.query)
  res.json({
    message: 'Lấy danh sách đội bóng thành công.',
    data: {
      teams,
      pagination
    }
  })
}

export const updateTeamController = async (req: Request<TeamIdReqParams, any, CreateTeamReqBody>, res: Response) => {
  const result = await teamsService.updateOne({
    body: req.body,
    teamId: new ObjectId(req.params.teamId)
  })
  res.json({
    message: 'Cập nhật đội bóng thành công.',
    data: result
  })
}

export const deleteTeamController = async (req: Request<TeamIdReqParams>, res: Response) => {
  await teamsService.deleteOne(new ObjectId(req.params.teamId))
  res.json({
    message: 'Xóa đội bóng thành công.'
  })
}

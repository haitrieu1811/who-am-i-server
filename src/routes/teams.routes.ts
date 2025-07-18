import { Router } from 'express'

import {
  createTeamController,
  deleteTeamController,
  getTeamsController,
  updateTeamController
} from '~/controllers/teams.controllers'
import { leagueIdValidator } from '~/middlewares/leagues.middlewares'
import { createTeamValidator, teamIdValidator } from '~/middlewares/teams.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const teamsRouter = Router()

teamsRouter.post(
  '/leagues/:leagueId',
  accessTokenValidator,
  isAdminValidator,
  leagueIdValidator,
  createTeamValidator,
  createTeamController
)

teamsRouter.get('/', paginationValidator, getTeamsController)

teamsRouter.put('/:teamId', accessTokenValidator, isAdminValidator, teamIdValidator, updateTeamController)

teamsRouter.delete('/:teamId', accessTokenValidator, isAdminValidator, teamIdValidator, deleteTeamController)

export default teamsRouter

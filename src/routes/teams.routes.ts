import { Router } from 'express'

import {
  createTeamController,
  deleteTeamController,
  getTeamsController,
  updateTeamController
} from '~/controllers/teams.controllers'
import { createTeamValidator, getTeamsValidator, teamIdValidator } from '~/middlewares/teams.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const teamsRouter = Router()

teamsRouter.post('/', accessTokenValidator, isAdminValidator, createTeamValidator, createTeamController)

teamsRouter.get('/', paginationValidator, getTeamsValidator, getTeamsController)

teamsRouter.put(
  '/:teamId',
  accessTokenValidator,
  isAdminValidator,
  teamIdValidator,
  createTeamValidator,
  updateTeamController
)

teamsRouter.delete('/:teamId', accessTokenValidator, isAdminValidator, teamIdValidator, deleteTeamController)

export default teamsRouter

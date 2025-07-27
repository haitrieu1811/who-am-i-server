import { Router } from 'express'

import {
  createLeagueController,
  deleteLeagueController,
  getLeagueController,
  getLeaguesController,
  updateLeagueController
} from '~/controllers/leagues.controllers'
import { createLeagueValidator, leagueIdValidator } from '~/middlewares/leagues.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const leaguesRouter = Router()

leaguesRouter.post('/', accessTokenValidator, isAdminValidator, createLeagueValidator, createLeagueController)

leaguesRouter.get('/', paginationValidator, getLeaguesController)

leaguesRouter.get('/:leagueId', leagueIdValidator, getLeagueController)

leaguesRouter.put('/:leagueId', accessTokenValidator, isAdminValidator, leagueIdValidator, updateLeagueController)

leaguesRouter.delete('/:leagueId', accessTokenValidator, isAdminValidator, leagueIdValidator, deleteLeagueController)

export default leaguesRouter

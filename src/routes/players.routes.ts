import { Router } from 'express'

import {
  createPlayerController,
  getPlayerController,
  getPlayersController,
  updatePlayerController
} from '~/controllers/players.controllers'
import { createPlayerValidator, playerIdValidator } from '~/middlewares/players.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const playersRouter = Router()

playersRouter.post('/', accessTokenValidator, isAdminValidator, createPlayerValidator, createPlayerController)

playersRouter.get('/', getPlayersController)

playersRouter.get('/:playerId', playerIdValidator, getPlayerController)

playersRouter.put(
  '/:playerId',
  accessTokenValidator,
  isAdminValidator,
  playerIdValidator,
  createPlayerValidator,
  updatePlayerController
)

export default playersRouter

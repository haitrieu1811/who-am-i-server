import { Router } from 'express'

import {
  createPlayerController,
  deletePlayerController,
  getPlayerController,
  getPlayersController,
  updatePlayerController
} from '~/controllers/players.controllers'
import { createPlayerValidator, getPlayersValidator, playerIdValidator } from '~/middlewares/players.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const playersRouter = Router()

playersRouter.post('/', accessTokenValidator, isAdminValidator, createPlayerValidator, createPlayerController)

playersRouter.get('/', getPlayersValidator, getPlayersController)

playersRouter.get('/:playerId', playerIdValidator, getPlayerController)

playersRouter.put(
  '/:playerId',
  accessTokenValidator,
  isAdminValidator,
  playerIdValidator,
  createPlayerValidator,
  updatePlayerController
)

playersRouter.delete('/:playerId', accessTokenValidator, isAdminValidator, playerIdValidator, deletePlayerController)

export default playersRouter

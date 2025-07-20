import { Router } from 'express'

import { createPlayerController, getPlayerController, getPlayersController } from '~/controllers/players.controllers'
import { createPlayerValidator, playerIdValidator } from '~/middlewares/players.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const playersRouter = Router()

playersRouter.post('/', accessTokenValidator, isAdminValidator, createPlayerValidator, createPlayerController)

playersRouter.get('/', getPlayersController)

playersRouter.get('/:playerId', playerIdValidator, getPlayerController)

export default playersRouter

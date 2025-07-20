import { Router } from 'express'

import { createPlayerController, getPlayersController } from '~/controllers/players.controllers'
import { createPlayerValidator } from '~/middlewares/players.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const playersRouter = Router()

playersRouter.post('/', accessTokenValidator, isAdminValidator, createPlayerValidator, createPlayerController)

playersRouter.get('/', getPlayersController)

export default playersRouter

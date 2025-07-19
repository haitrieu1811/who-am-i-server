import { Router } from 'express'

import { createPlayerController } from '~/controllers/players.controllers'
import { createPlayerValidator } from '~/middlewares/players.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const playersRouter = Router()

playersRouter.post('/', accessTokenValidator, isAdminValidator, createPlayerValidator, createPlayerController)

export default playersRouter

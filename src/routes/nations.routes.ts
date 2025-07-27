import { Router } from 'express'

import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import {
  createNationController,
  deleteNationController,
  getNationController,
  getNationsController,
  updateNationController
} from '~/controllers/nations.controllers'
import { createNationValidator, nationIdValidator } from '~/middlewares/nations.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const nationsRouter = Router()

nationsRouter.post('/', accessTokenValidator, isAdminValidator, createNationValidator, createNationController)

nationsRouter.get('/', paginationValidator, getNationsController)

nationsRouter.get('/:nationId', nationIdValidator, getNationController)

nationsRouter.put('/:nationId', accessTokenValidator, isAdminValidator, nationIdValidator, updateNationController)

nationsRouter.delete('/:nationId', accessTokenValidator, isAdminValidator, nationIdValidator, deleteNationController)

export default nationsRouter

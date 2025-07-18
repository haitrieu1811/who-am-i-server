import { Router } from 'express'

import { uploadImagesController } from '~/controllers/images.controllers'

const imagesRouter = Router()

imagesRouter.post('/upload', uploadImagesController)

export default imagesRouter

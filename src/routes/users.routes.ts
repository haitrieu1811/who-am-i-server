import { Router } from 'express'

import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Đăng ký
usersRouter.post('/register', registerValidator, registerController)

// Đăng nhập
usersRouter.post('/login', loginValidator, loginController)

export default usersRouter

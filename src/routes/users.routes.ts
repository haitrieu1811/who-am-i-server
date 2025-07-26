import { Router } from 'express'

import { loginController, refreshTokenController, registerController } from '~/controllers/users.controllers'
import { loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Đăng ký
usersRouter.post('/register', registerValidator, registerController)

// Đăng nhập
usersRouter.post('/login', loginValidator, loginController)

// Refresh token
usersRouter.post('/refresh-token', refreshTokenValidator, refreshTokenController)

export default usersRouter

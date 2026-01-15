import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'

const routerAuth = Router()

routerAuth.post('/create-account', AuthController.createAccount)








export default routerAuth
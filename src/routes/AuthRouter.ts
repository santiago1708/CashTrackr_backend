import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'

const routerAuth = Router()

routerAuth.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .notEmpty().withMessage('El correo electronico es obligatorio')
        .isEmail().withMessage('El email no es valido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({min: 8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)








export default routerAuth
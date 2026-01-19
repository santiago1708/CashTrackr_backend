import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { Limiter } from '../config/limiter'
import { authenticateJWT } from '../middleware/auth'

const routerAuth = Router()
routerAuth.use(Limiter)


routerAuth.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .notEmpty().withMessage('El correo electronico es obligatorio')
        .isEmail().withMessage('El email no es valido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)

routerAuth.post('/confirm-account',
    body('token')
        .notEmpty()
        .isInt()
        .isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    handleInputErrors,
    AuthController.confirmAccount)

routerAuth.post('/login',
    body('email')
        .isEmail().withMessage('El email no es valido')
        .notEmpty().withMessage('El correo electronico es obligatorio'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleInputErrors,
    AuthController.login)


routerAuth.post('/forgot-password',
    body('email')
        .isEmail().withMessage('El email no es valido')
        .notEmpty().withMessage('El correo electronico es obligatorio'),
    handleInputErrors,
    AuthController.forgotPassword)

routerAuth.post('/validate-token',
    body('token')
        .notEmpty()
        .isInt()
        .isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    handleInputErrors,
    AuthController.validateToken)

routerAuth.post('/reset-password/:token',
    param('token')
        .isInt()
        .isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    body('password')
        .notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword')
        .notEmpty().withMessage('La contraseña nueva es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('samePassword')
        .notEmpty().withMessage('La confirmación de la contraseña es obligatoria')
        .custom(value => value !== 'newPassword').withMessage('Las contraseñas no coinciden'),
    handleInputErrors,
    AuthController.resetPassword
)
routerAuth.get('/user' , 
    authenticateJWT,
    AuthController.user)


export default routerAuth
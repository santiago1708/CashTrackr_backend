import { comparePassword } from './../utils/auth';
import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt';
import { generateToken } from '../utils/token';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        const { email, password } = req.body
        try {
            const userEmailExist = await User.findOne({ where: { email } }) // buscar si el email ya existe

            if (userEmailExist) { // si existe, retornar error
                const error = new Error('El correo ya esta registrado')
                res.status(409).json({ error: error.message })
                return
            }

            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.token = generateToken()
            await user.save()

            await AuthEmail.sendConfirmationEmail(
                {
                    name: user.name,
                    email: user.email,
                    token: user.token
                }
            )

            res.json('Usuario creado correctamente!')
        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        try {
            const isTokenValid = await User.findOne({ where: { token } })

            if (!isTokenValid) {
                const error = new Error('Token no valido')
                res.status(401).json({ error: error.message })
                return
            }

            isTokenValid.confirmed = true
            isTokenValid.token = ''
            await isTokenValid.save()

            res.json('Cuenta confirmada conrrectamente!')
        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        try {
            const user = await User.findOne({ where: { email } })

            // Verificar si el usuario existe
            if (!user) {
                const error = new Error('El usuario no existe')
                res.status(404).json({ error: error.message })
                return
            }

            // Verificar si el usuario esta confirmado
            if (!user.confirmed) {
                const error = new Error('Tu cuenta no ha sido confimada')
                res.status(403).json({ error: error.message })
                return
            }

            const isPasswordCorrect = await comparePassword(password, user.password)

            // Verificar si la contraseña es incorrecta
            if (!isPasswordCorrect) {
                const error = new Error('Los datos son incorrectos')
                res.status(401).json({ error: error.message })
                return
            }

            const token = generateJWT(user.id)
            res.json(token)

        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body
        try {
            const user = await User.findOne({ where: { email } })

            //Revisar si el usuario existe
            if (!user) {
                const error = new Error('El usuario no existe')
                res.status(404).json({ error: error.message })
                return
            }


            user.token = generateToken() //Generamos un nuevo token
            await user.save()

            await AuthEmail.sendResetPassword({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.json('Hemos enviado un email con las instrucciones')

        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body
        try {
            const tokenExist = await User.findOne({ where: { token } })

            if (!tokenExist) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }

            res.json('Token valido')

        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }
}
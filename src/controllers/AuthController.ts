import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'

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

            if(!user) {
                const error = new Error('El usuario no existe')
                res.status(404).json({ error: error.message})
                return
            }

            res.json('inicio de sesion bien')


        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }
}
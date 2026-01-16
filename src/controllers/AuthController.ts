import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/Auth'
import { generateToken } from '../utils/token'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        const {email, password} = req.body
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
            res.json('Usuario creado correctamente!')
        } catch (e) {
            const error = new Error('Hubo un error')
            res.status(500).json({ error: error.message })
            return
        }
    }
}
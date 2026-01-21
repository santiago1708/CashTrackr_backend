import type { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt";
import User from "../models/User";


declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    if (!authorization) {
        const error = new Error('No autorizado')
        res.status(401).json({ error: error.message })
        return
    }
    const [, token] = authorization.split(' ')
    if (!token) {
        const error = new Error('Token no válido')
        res.status(401).json({ error: error.message })
        return
    }
    try {
        const decoded = verifyJWT(token)
        if (typeof decoded === 'object' && decoded.id) { // Realizamos la comprobacion del tipo de dato y si existe un id
            req.user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email'] // Excluir campos sensibles como la contraseña
            })
            next()
        }
    } catch (e) {
        console.log(e)
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
        return
    }
}
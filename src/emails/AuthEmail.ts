import {} from 'nodemailer'
import { transport } from '../config/nodemailer'

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user : EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@gmail.com',
            to: user.email,
            subject: 'CashTrackr - Confirma tu cuenta',
            html: `
                <p>Hola ${user.name}, confirma tu cuenta en CashTrackr</p>
                <p>Tu cuenta ya esta casi lista, solo debes confirmarla en el siguiente enlace:</p>
                <a href="#">Confirmar Cuenta</a>
                <p>e Ingresa el codigo: <b>${user.token}</b></p>
                <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
            `
        })

        console.log(email)
    }
}
import { createRequest, createResponse } from 'node-mocks-http'
import User from '../../../models/User'
import { users } from '../../mocks/user'
import { AuthController } from '../../../controllers/AuthController'
import { hashPassword } from '../../../utils/auth'
import { generateToken } from '../../../utils/token'
import { AuthEmail } from '../../../emails/AuthEmail'

jest.mock('../../../models/User')
jest.mock('../../../utils/auth')
jest.mock('../../../utils/token')

beforeEach(() => {
    jest.resetAllMocks() //Importante si quieres que ningun otro mock herede en otra prueba
})
describe('AuthController - CreateAccount', () => {

    it('Should throw an error with status 409 when it finds a registered email', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'email@test.com',
                password: 'password'
            }
        })
        const res = createResponse()

        await AuthController.createAccount(req, res)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(409)
        expect(data).toEqual({ error: 'El correo ya esta registrado' })
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should register a new user and return a succes message', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'email@test.com',
                password: 'password',
                name: 'test name'
            }
        })

        const tok = '123456'
        const hash = 'hashpassword'

        const userMock = { ...req.body, save: jest.fn() };
        (User.create as jest.Mock).mockResolvedValue(userMock);
        (hashPassword as jest.Mock).mockResolvedValue(hash); //mockResolvedValue resuelve funciones asincronas
        (generateToken as jest.Mock).mockReturnValue(tok); //mockReturnValue resuelve funciones sincronas

        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve()); //Lanzar el AuthEmail.senConfirmationEmail

        const res = createResponse()

        await AuthController.createAccount(req, res)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(201)
        expect(data).toEqual('Usuario creado correctamente!')
        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.password).toBe(hash)
        expect(userMock.token).toBe(tok)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: tok
        })
    })
})

describe('AuthController - confirmAccount', () => {
    it('Should throw an error with status 401 when it token is not valid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/confirm-account',
            body: {
                token: '123456'
            }
        })
        const res = createResponse();

        await AuthController.confirmAccount(req, res)
        const data = res._getJSONData()


        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty('error', 'Token no valido')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should return a message of account confirm', async () => {
        const userMock = {
            token: '123456',
            confirmed: false,
            save: jest.fn().mockResolvedValue(true)
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/confirm-account',
            body: {
                token: userMock.token
            }
        })
        const res = createResponse();

        await AuthController.confirmAccount(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { token: req.body.token }
        })
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.save).toHaveBeenCalledTimes(1)
        expect(userMock.confirmed).toBe(true)
        expect(userMock.token).toBeFalsy()
        expect(data).toEqual('Cuenta confirmada correctamente!')
    })
})

describe('AuthController - forgotPassword', () => {
    it('Should throw an error with status 404 when it find a user not exist', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/forgot-password',
            body: {
                email: 'test@test.com'
            }
        })
        const res = createResponse();
        await AuthController.forgotPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'El usuario no existe')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email }
        })
    })

    it('Should send reset password email', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/forgot-password',
            body: {
                email: 'test@test.com'
            }
        });
        const userMock = {
            token: '123456',
            save: jest.fn().mockResolvedValue(true)
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (generateToken as jest.Mock).mockResolvedValue(userMock.token)
        jest.spyOn(AuthEmail, "sendResetPassword").mockImplementation(() => Promise.resolve())
        const res = createResponse();
        await AuthController.forgotPassword(req, res)

        const data = res._getJSONData()


        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Hemos enviado un email con las instrucciones')

        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email }
        })

        expect(userMock.save).toHaveBeenCalled()
        expect(AuthEmail.sendResetPassword).toHaveBeenCalledTimes(1)
    })
})

describe('AuthController - validateToken', () => {
    it('Should throw error when it token is not valid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/validate-token',
            body: {
                email: 'test@test.com'
            }
        })
        const res = createResponse();
        await AuthController.forgotPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'El usuario no existe')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email }
        })
    })

})
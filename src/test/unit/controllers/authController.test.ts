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

describe('AuthController - CreateAccount', () => {

    beforeEach(() => {
        jest.resetAllMocks() //Importante si quieres que ningun otro mock herede en otra prueba
    })

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
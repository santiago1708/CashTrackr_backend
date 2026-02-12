import { body } from 'express-validator';
import { createRequest, createResponse } from 'node-mocks-http'
import User from '../../../models/User'
import { AuthController } from '../../../controllers/AuthController'
import { comparePassword, hashPassword } from '../../../utils/auth'
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
                token: '123456'
            }
        })
        const res = createResponse();
        await AuthController.validateToken(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'Token no valido')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { token: req.body.token }
        })
    })

    it('Should return a message successful', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/validate-token',
            body: {
                token: '123456'
            }
        });
        const res = createResponse();
        await AuthController.validateToken(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Token valido')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { token: req.body.token }
        })
    })
})

describe('AuthController - resetPassword', () => {
    it('Should throw an error with status 404 when it find a user not exist ', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const token = '123456'
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/reset-password/:token',
            body: {
                password: 'hashpassword'
            },
            headers: {
                token
            }
        })
        const res = createResponse();
        await AuthController.resetPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'Token no valido')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { token: req.headers.token }
        })
    })

    it('Should return a message succeful and reset password', async () => {
        const token = '123456'
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/reset-password/:token',
            body: {
                password: 'hashpassword'
            },
            headers: {
                token
            }
        });
        const userMock = {
            token,
            save: jest.fn().mockResolvedValue(true)
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (hashPassword as jest.Mock).mockResolvedValue(req.body.password)
        const res = createResponse();
        await AuthController.resetPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Contraseña actualizada con exito!')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            where: { token }
        })
        expect(hashPassword).toHaveBeenCalled()
        expect(hashPassword).toHaveBeenCalledTimes(1)
        expect(hashPassword).toHaveBeenCalledWith(req.body.password)

        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.save).toHaveBeenCalledTimes(1)

        expect(userMock.token).toEqual('')
    })
})

describe('AuthController - user', () => {
    it('Should return a user', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/auth/user',
            user: {
                id: 1,
                name: 'Name test',
                email: 'test@test.com'
            }
        })
        const res = createResponse();
        await AuthController.user(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(req.user)
    })
})

describe('AuthController - updateCurrentUserPassword', () => {
    it('Should throw error when current password is incorrect', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/update-password',
            body: {
                password: 'wrongPassword',
                newPassword: 'newpassword'
            },
            user: {
                id: 1
            }
        });
        const userMock = {
            password: 'hashpasswordgreat'

        };
        (User.findByPk as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(false)
        const res = createResponse();
        await AuthController.updateCurrentUserPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty('error', 'La contraseña actual es incorrecta')
        expect(User.findByPk).toHaveBeenCalled()
        expect(User.findByPk).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalled()
        expect(comparePassword).toHaveBeenCalledTimes(1)
    })

    it('Should update password with the new password and return a message succesful', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/update-password',
            body: {
                password: 'plainPassword',
                newPassword: 'newpassword'
            },
            user: {
                id: 1
            }
        });
        const userMock = {
            password: 'hashedPasswordFromDB',
            save: jest.fn()
        };
        const originalPassword = userMock.password;
        (User.findByPk as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(true);
        (hashPassword as jest.Mock).mockResolvedValue(req.body.newPassword)
        const res = createResponse();
        await AuthController.updateCurrentUserPassword(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Contraseña actualizada con exito!')
        expect(User.findByPk).toHaveBeenCalled()
        expect(User.findByPk).toHaveBeenCalledTimes(1)
        expect(User.findByPk).toHaveBeenCalledWith(req.user.id, { attributes: ['password'] })

        expect(comparePassword).toHaveBeenCalled()
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, originalPassword)

        expect(hashPassword).toHaveBeenCalled()
        expect(hashPassword).toHaveBeenCalledTimes(1)
        expect(hashPassword).toHaveBeenCalledWith(userMock.password)

        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.save).toHaveBeenCalledTimes(1)
    })
})

describe('AuthController - CheckPassword', () => {
    it('Should throw error if the password is wrong', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/check-password',
            body: {
                password: 'password'
            },
            user: {
                id: 1
            }
        });
        const userMock = {
            password: req.body.password
        };
        (User.findByPk as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(false)
        const res = createResponse()
        await AuthController.checkPassword(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty('error', 'La contraseña actual es incorrecta')

        expect(User.findByPk).toHaveBeenCalled()
        expect(User.findByPk).toHaveBeenCalledTimes(1)
        expect(User.findByPk).toHaveBeenCalledWith(req.user.id, { attributes: ['password'] })

        expect(comparePassword).toHaveBeenCalled()
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, userMock.password)
    })

    it('Should check the password and return a message succeful', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/check-password',
            body: {
                password: 'password'
            },
            user: {
                id: 1
            }
        });
        const userMock = {
            password: req.body.password
        };
        (User.findByPk as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(true)
        const res = createResponse()
        await AuthController.checkPassword(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Contraseña correcta!')

        expect(User.findByPk).toHaveBeenCalledWith(req.user.id, {
            attributes: ['password']
        })
        expect(User.findByPk).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, userMock.password)
        expect(comparePassword).toHaveBeenCalledTimes(1)
    })
})

describe('AuthController - Login', () => {
    it('Should throw error when the user is not exist', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        });
        const res = createResponse();
        (User.findOne as jest.Mock).mockResolvedValue(false)
        await AuthController.login(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'El usuario no existe')
        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email }
        })
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should throw error when the user is not confirmed', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        });
        const res = createResponse();
        const userMock = {
            user: {
                confirmed: false
            }
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock)
        await AuthController.login(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(403)
        expect(data).toHaveProperty('error', 'Tu cuenta no ha sido confimada')

        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email }
        })
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })
})
import { createRequest, createResponse } from 'node-mocks-http'
import { budgets } from '../../mocks/budgets'
import { BudgetController } from '../../../controllers/BudgetController'
import Budget from '../../../models/Budget'
import Expense from '../../../models/Expense'
jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}))

describe('BudgetController.getAll', () => {

    beforeEach(() => { // BeforeEach se ejecuta antes de cada it y se repite la cantidad de it que hayan
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = budgets.filter(budget => budget.UserId === options.where.UserId)
            return Promise.resolve(updatedBudgets)
        })
    })

    it('should retrive 2 budgets for user with id 1 ', async () => {
        const req = createRequest({
            method: 'GET', //No es importante pero es mas explicito
            utl: '/api/budgets', // NO es importante pero es mas explicito
            user: { id: 1 }
        })
        const res = createResponse(); //Importante este ;

        await BudgetController.getAll(req, res)
        const data = res._getJSONData()
        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
    it('should retrive 1 budgets for user with id 2 ', async () => {
        const req = createRequest({
            method: 'GET', //No es importante pero es mas explicito
            utl: '/api/budgets', // NO es importante pero es mas explicito
            user: { id: 2 }
        })
        const res = createResponse(); //Importante este ;

        await BudgetController.getAll(req, res)
        const data = res._getJSONData()
        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
    it('should retrive 0 budgets for user with id 10 ', async () => {
        const req = createRequest({
            method: 'GET', //No es importante pero es mas explicito
            utl: '/api/budgets', // NO es importante pero es mas explicito
            user: { id: 10 }
        })
        const res = createResponse(); //Importante este ;

        await BudgetController.getAll(req, res)
        const data = res._getJSONData()
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
    it('should handle arrors when fetching budgets', async () => {
        const req = createRequest({
            method: 'GET', //No es importante pero es mas explicito
            utl: '/api/budgets', // NO es importante pero es mas explicito
            user: { id: 100 }
        })
        const res = createResponse(); //Importante este ;
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error)
        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toStrictEqual({ error: 'Ocurrio un error' })
    })

})

describe('BudgetController.create', () => {
    it('Should create a new Budget and respond with statusCode 201', async () => {
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true) // Simular la fucnion save()
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget) //Resuelva el metodo save
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: { name: 'Presupuesto prueba', amout: 1000 }
        })
        const res = createResponse()
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(201)
        expect(data).toBe('Presupuesto creado correctamente!')
        expect(mockBudget.save).toHaveBeenCalled() //Se asegura que se mando a llamar
        expect(mockBudget.save).toHaveBeenCalledTimes(1) //Se asegura que se mando a llamar solo una vez
        expect(Budget.create).toHaveBeenCalledWith(req.body) // Create se manda a llamar si hay un req.body?
    })

    it('should handle budget creation error', async () => {
        const mockBudget = {
            save: jest.fn() // Simular la fucnion save() pero no la manda a llamar
        };
        (Budget.create as jest.Mock).mockRejectedValue(new Error) //Obliga a ocurrir un error
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 100 },
            body: { name: 'Presupuesto prueba', amout: "1000" }
        })
        const res = createResponse()
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toStrictEqual({ error: 'Ocurrio un error' })
        expect(mockBudget.save).not.toHaveBeenCalled()
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })

})

describe('BudgetController.getById', () => {

    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockImplementation((id) => {
            const updatedBudgets = budgets.filter(budget => budget.id === id)[0] //El filter te retorna un arreglo, para mostrar un objeto nos colocamos en la posicion 0
            return Promise.resolve(updatedBudgets)
        })
    })

    it('Should return a budget with Id 1 and 3 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 1 }
        })
        const res = createResponse()
        await BudgetController.getById(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(3) //Tiene 3 expenses
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense],
        })

    })
    it('Should return a budget with Id 2 and 2 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 2 }
        })
        const res = createResponse()
        await BudgetController.getById(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(2) //Tiene 3 expenses
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense],
        })
    })
    it('Should return a budget with Id 3 and 0 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 3 }
        })
        const res = createResponse()
        await BudgetController.getById(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(0) //Tiene 3 expenses
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense],
        })
    })
})

describe('BudgetController.updateById', () => {
    it('Should update a budget with id 1', async () => {
        const mockUpdate = {
            update: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget: mockUpdate,
            body: { name: 'Nombre Prueba', amount: 100 }
        })
        const res = createResponse()
        await BudgetController.updateById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe('Presupuesto actualizado con exito!')
        expect(mockUpdate.update).toHaveBeenCalled()
        expect(mockUpdate.update).toHaveBeenCalledTimes(1)
        expect(mockUpdate.update).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.deleteById', () => {
    it('Should delete budget with id 1', async () => {
        const mockDelete = {
            destroy: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: mockDelete
        })
        const res = createResponse()
        await BudgetController.deleteById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toBe('Presupuesto ha sido eliminado con exito!')
        expect(mockDelete.destroy).toHaveBeenCalled()
        expect(mockDelete.destroy).toHaveBeenCalledTimes(1)
    })
})


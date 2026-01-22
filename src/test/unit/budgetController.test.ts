import { createRequest, createResponse } from 'node-mocks-http'
import { budgets } from '../mocks/budgets'
import { BudgetController } from '../../controllers/BudgetController'
import Budget from '../../models/Budget'
jest.mock('../../models/Budget', () => ({
    findAll: jest.fn()
}))

describe('BudgetController.getAll', () => {

    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = budgets.filter(budget => budget.userId === options.where.UserId)
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

})
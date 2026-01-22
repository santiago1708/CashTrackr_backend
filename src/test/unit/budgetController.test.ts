import { createRequest, createResponse } from 'node-mocks-http'
import { budgets } from '../mocks/budgets'
import { BudgetController } from '../../controllers/BudgetController'
import Budget from '../../models/Budget'
jest.mock('../../models/Budget', () => ({
    findAll: jest.fn()
}))

describe('BudgetController.getAll', () => {
    it('should retrive 2 budgets for user with id 1 ', async () => {

        const req = createRequest({
            method: 'GET',
            utl: '/api/budgets',
            user: { id: 1 }
        })
        const res = createResponse(); //Importante este ;

        (Budget.findAll as jest.Mock).mockResolvedValue(budgets.filter(budget => budget.userId === req.user.id))
        await BudgetController.getAll(req, res)
        const data = res._getJSONData()
        expect(data).toHaveLength(2)
    })
})
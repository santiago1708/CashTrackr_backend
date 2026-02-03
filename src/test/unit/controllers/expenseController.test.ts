import { createRequest, createResponse} from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpenseController'

jest.mock('../../../models/Expense', () => ({
    create: jest.fn()
}))

describe('ExpensesController - create' , () => {
    it('Should create a new Expense in an budget', async () => {
        const mockSave = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Expense.create as jest.Mock).mockResolvedValue(mockSave)
        const req = createRequest({
            method: 'POST',
            utl: '/api/budgets/:budgetId/expenses', 
            budget: { id: 1 },
            body: {name: 'Body test', amount: 300}
        })
        const res = createResponse();
        await ExpensesController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(201)
        expect(data).toBe('Gasto agregado correctamente!')
        expect(mockSave.save).toHaveBeenCalled()
        expect(mockSave.save).toHaveBeenCalledTimes(1)
    })
})
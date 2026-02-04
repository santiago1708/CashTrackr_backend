import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { expenses } from '../../mocks/expenses'
import { validateExpenseExits } from '../../../middleware/expense'

jest.mock('../../../models/Expense', () => ({
    findByPk: jest.fn()
}))

describe('Expense - ValidateExpenseExits', () => {

    beforeEach( () => {
        (Expense.findByPk as jest.Mock).mockImplementation((expenseId) => {
            const expense = expenses.filter( e => e.id === expenseId)[0] ?? null
            return Promise.resolve(expense)
        })
    })

    it('Should proced a next middleware if expense exist', async () => {
        const req = createRequest({
            params: { expenseId: 1, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()
        await validateExpenseExits(req, res, next)

        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.expense).toEqual(expenses[0])
    })

    it('Should handle no exist expense', async () => {
        const req = createRequest({
            params: { expenseId: 10, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()
        await validateExpenseExits(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'Gasto no encontrado'})
        expect(next).not.toHaveBeenCalled()
    })

    it('Should handle no exist expense', async () => {
        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)
        const req = createRequest({
            params: { expenseId: 1, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()
        await validateExpenseExits(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(next).not.toHaveBeenCalled()
    })
})
import { createRequest, createResponse } from 'node-mocks-http'
import { expenses } from './../../mocks/expenses';
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpenseController'

jest.mock('../../../models/Expense', () => ({
    create: jest.fn()
}))

describe('ExpensesController - create', () => {
    it('Should create a new Expense in an budget', async () => {
        const mockSave = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Expense.create as jest.Mock).mockResolvedValue(mockSave)
        const req = createRequest({
            method: 'POST',
            utl: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: { name: 'Body test', amount: 300 }
        })
        const res = createResponse();
        await ExpensesController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(201)
        expect(data).toBe('Gasto agregado correctamente!')
        expect(mockSave.save).toHaveBeenCalled()
        expect(mockSave.save).toHaveBeenCalledTimes(1)
        expect(Expense.create).toHaveBeenCalledWith(req.body)
    })

    it('Should handle expense creation error', async () => {
        const mockSave = {
            save: jest.fn()
        };
        (Expense.create as jest.Mock).mockResolvedValue(new Error)
        const req = createRequest({
            method: 'POST',
            utl: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: { name: 'Body test', amount: 300 }
        })
        const res = createResponse();
        await ExpensesController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ error: 'Hubo un error' })
        expect(mockSave.save).not.toHaveBeenCalled()
        expect(Expense.create).toHaveBeenCalledWith(req.body)
    })
})

describe('ExpensesController - getById', () => {
    it('Should get an expense by id', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses[0]
        })
        const res = createResponse();
        await ExpensesController.getById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toEqual(expenses[0])
    })
})

describe('ExpensesController - updateById', () => {
    it('Should update expense by Id', async () => {
        const mockExpense = {
            update: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: mockExpense,
            body: {name : 'Testing update', amount : 100}
        })
        const res = createResponse();
        await ExpensesController.updateById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Gasto ha sido actualizado con exito!')
        expect(mockExpense.update).toHaveBeenCalled()
        expect(mockExpense.update).toHaveBeenCalledWith(req.body)
    })
})

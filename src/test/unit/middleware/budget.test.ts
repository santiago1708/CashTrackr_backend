import { createRequest, createResponse } from 'node-mocks-http'
import { validateBudgetExists } from '../../../middleware/budget'
import Budget from '../../../models/Budget'
import { budgets } from '../../mocks/budgets'

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn()
}))

describe('Budget - validateBudgetExists', () => {
    it('Should handle non-existent budget', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null) //Forza un error valido
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()
        await validateBudgetExists(req, res, next)
        const data = res._getJSONData()
        //Assert 
        expect(res.statusCode).toBe(404)
        expect(data).toStrictEqual({ error: 'Presupuesto no encontrado' })
        expect(next).not.toHaveBeenCalled() //Importante que el middlaware no mande a llamar el next()
    })

    it('Should proced to next middleware if budget exists', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
        expect(next).toHaveBeenCalled() //Se mando a llamar el next
        expect(req.budget).toEqual(budgets[0])
    })

    it('Should handle non-existent budget', async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error) //Forza el error hacia el catch
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()
        await validateBudgetExists(req, res, next)
        const data = res._getJSONData()
        //Assert 
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ error: 'Ocurrio un error' })
        expect(next).not.toHaveBeenCalled()
    })
})
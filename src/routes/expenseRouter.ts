import { Router } from 'express'
import { ExpensesController } from '../controllers/ExpenseController'
import { validateExpenseInput } from '../middleware/expense'

const routerExpense = Router({mergeParams: true})

routerExpense.post('/', 
    validateExpenseInput,
    ExpensesController.create)
routerExpense.get('/:expenseId', ExpensesController.getById)
routerExpense.put('/:expenseId', ExpensesController.updateById)
routerExpense.delete('/:expenseId', ExpensesController.deleteById)


export default routerExpense
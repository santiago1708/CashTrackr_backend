import { Router } from 'express'
import { ExpensesController } from '../controllers/ExpenseController'
import { validateExpenseExits, validateExpenseId, validateExpenseInput } from '../middleware/expense'

const routerExpense = Router({mergeParams: true})

routerExpense.param('expenseId', validateExpenseId)
routerExpense.param('expenseId', validateExpenseExits)

routerExpense.post('/', 
    validateExpenseInput,
    ExpensesController.create)
routerExpense.get('/:expenseId', ExpensesController.getById)
routerExpense.put('/:expenseId', 
    validateExpenseInput,
    ExpensesController.updateById)
routerExpense.delete('/:expenseId', ExpensesController.deleteById)


export default routerExpense 
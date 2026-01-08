import { Router } from 'express'
import { body, param } from 'express-validator'
import { BudgetController } from '../controllers/BudgetController'
import { handleInputErrors } from '../middleware/validation'
import { validateBudgetExists, validateBudgetId, validateBudgetInput } from '../middleware/budget'
import routerExpense from './expenseRouter'

const router = Router()

router.param('budgetId', validateBudgetId)
router.param('budgetId', validateBudgetExists)

router.get('/', BudgetController.getAll)

router.post('/',
    
    handleInputErrors,
    BudgetController.create)

router.get('/:budgetId',
    BudgetController.getById)

router.put('/:budgetId',
    validateBudgetInput,
    BudgetController.updateById)

router.delete('/:budgetId',
    BudgetController.deleteById)

router.use('/:budgetId/expenses', routerExpense)
export default router
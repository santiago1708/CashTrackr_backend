import { Router } from 'express'
import { BudgetController } from '../controllers/budgetController'

const router = Router()

router.get('/', BudgetController.getAll)


export default router
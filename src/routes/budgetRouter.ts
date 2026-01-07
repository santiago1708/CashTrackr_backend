import { Router } from 'express'
import { body, param } from 'express-validator'
import { BudgetController } from '../controllers/BudgetController'
import { handleInputErrors } from '../middleware/validation'
import { validateBudgetExists, validateBudgetId } from '../middleware/budget'

const router = Router()

router.get('/', BudgetController.getAll)

router.post('/',
    body('name')
        .notEmpty().withMessage('El campo nombre no puede ir vacio'),
    body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacia')
        .isNumeric().withMessage('Cantidad no valida')
        .custom(value => value > 0).withMessage('El presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.create)

router.get('/:id',
    validateBudgetId,
    validateBudgetExists,
    handleInputErrors,
    BudgetController.getById)

router.put('/:id',
    validateBudgetId,
    validateBudgetExists,
    body('name')
        .notEmpty().withMessage('El campo nombre no puede ir vacio'),
    body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacia')
        .isNumeric().withMessage('Cantidad no valida')
        .custom(value => value > 0).withMessage('El presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.updateById)

router.delete('/:id',
    validateBudgetId,
    handleInputErrors,
    validateBudgetExists,
    BudgetController.deleteById)


export default router
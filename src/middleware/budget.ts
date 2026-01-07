import type { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";

export const validateBudgetId =async (req: Request, res: Response, next: NextFunction) => {

    await param('id')
        .isInt().withMessage('Id No valido')
        .custom(value => value > 0).withMessage('id no valido')
        .run(req)

    next()
}
import type { Request, Response } from 'express'
import Budget from '../models/Budget'

export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        console.log('Desde /api/budgets')
    }
    static create = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body)
            await budget.save()
            res.status(201).json('Presupuesto creado correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static getById = async (req: Request, res: Response) => {
        console.log('Desde Get BY Id /api/budgets/:id')
    }
    static updateById = async (req: Request, res: Response) => {
        console.log('Desde UpdateById /api/budgets/:id')
    }
    static deleteById = async (req: Request, res: Response) => {
        console.log('Desde DeleteById /api/budgets/:id')
    }

}
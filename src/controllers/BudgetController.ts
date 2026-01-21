import type { Request, Response } from 'express'
import Budget from '../models/Budget'
import Expense from '../models/Expense'

export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        const { id } = req.user
        try {
            const budget = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC'] //Se muestra los mas nuevos
                ],
                where: { UserId: id }
            })
            res.json(budget)
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static create = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body)
            budget.UserId = req.user.id
            await budget.save()
            res.status(201).json('Presupuesto creado correctamente!')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static getById = async (req: Request, res: Response) => {
        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense],
        })
        res.json(budget)
    }
    static updateById = async (req: Request, res: Response) => {
        await req.budget.update(req.body)
        res.status(200).json('Presupuesto actualizado con exito!')
    }
    static deleteById = async (req: Request, res: Response) => {
        await req.budget.destroy()
        res.json('Presupuesto ha sido eliminado con exito!')
    }

}
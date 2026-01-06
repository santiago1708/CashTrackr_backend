import type { Request, Response } from 'express'
import Budget from '../models/Budget'

export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const budget = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC'] //Se muestra los mas nuevos
                ]
                //TODO: FIltrar por el usuario autenticado
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
            await budget.save()
            res.status(201).json('Presupuesto creado correctamente!')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const budget = await Budget.findByPk(id, {})

            if (!budget) {
                const error = new Error('Presupuesto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            res.json(budget)
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static updateById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const budget = await Budget.findByPk(id, {})

            if (!budget) {
                const error = new Error('Presupuesto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            await budget.update(req.body)
            res.status(200).json('Presupuesto actualizado con exito!')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }
    static deleteById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const budget = await Budget.findByPk(id, {})

            if (!budget) {
                const error = new Error('Presupuesto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            await budget.destroy()
            res.json('Presupuesto ha sido eliminado con exito!')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Ocurrio un error' })
        }
    }

}
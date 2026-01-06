import type { Request, Response } from 'express'

export class BudgetController {

    static getAll = async (req : Request, res : Response) => {
        console.log('Desde /api/budgets')
    }
    static create = async (req : Request, res : Response) => {
        console.log('Desde Post /api/budgets')
    }
    static getById = async (req : Request, res : Response) => {
        console.log('Desde Get BY Id /api/budgets/:id')
    }
    static updateById = async (req : Request, res : Response) => {
        console.log('Desde UpdateById /api/budgets/:id')
    }
    static deleteById = async (req : Request, res : Response) => {
        console.log('Desde DeleteById /api/budgets/:id')
    }

}